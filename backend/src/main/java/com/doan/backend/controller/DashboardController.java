package com.doan.backend.controller;

import com.doan.backend.repository.ProjectRepository;
import com.doan.backend.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*") // Cho phép Frontend truy cập
public class DashboardController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private com.doan.backend.repository.ProjectMemberRepository projectMemberRepository;


    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String role) {
        
        List<com.doan.backend.entity.Project> projects;
        List<com.doan.backend.entity.Task> tasks;

        if ("SUPER_ADMIN".equals(role) || "EXECUTIVE".equals(role)) {
            projects = projectRepository.findAll();
            tasks = taskRepository.findAll();
        } else if ("TASK_MANAGER".equals(role) || "CLIENT".equals(role)) {
            projects = new java.util.ArrayList<>();
            for (com.doan.backend.entity.Project p : projectRepository.findAll()) {
                if (userId != null) {
                    for (com.doan.backend.entity.ProjectMember m : projectMemberRepository.findByProjectId(p.getId())) {
                        if (userId.equals(m.getUserId())) {
                            projects.add(p);
                            break;
                        }
                    }
                }
            }
            
            tasks = new java.util.ArrayList<>();
            for (com.doan.backend.entity.Task t : taskRepository.findAll()) {
                if (t.getProjectId() != null) {
                    for (com.doan.backend.entity.Project p : projects) {
                        if (p.getId().equals(t.getProjectId())) {
                            tasks.add(t);
                            break;
                        }
                    }
                }
            }
        } else if ("MEMBER".equals(role)) {
            projects = new java.util.ArrayList<>();
            List<com.doan.backend.entity.Task> allTasks = taskRepository.findAll();
            tasks = new java.util.ArrayList<>();
            for (com.doan.backend.entity.Task t : allTasks) {
                if (userId != null && userId.equals(t.getAssigneeId())) {
                    tasks.add(t);
                }
            }
        } else {
            projects = new java.util.ArrayList<>();
            tasks = new java.util.ArrayList<>();
        }

        LocalDateTime now = LocalDateTime.now();

        long pTodoCount = 0;
        long pInProgressCount = 0;
        long pDoneCount = 0;
        long pCancelledCount = 0;
        long overdueProjects = 0;
        
        java.time.LocalDate today = java.time.LocalDate.now();
        
        long overdueTasks = tasks.stream()
                .filter(t -> t.getDeadline() != null && t.getDeadline().toLocalDate().isBefore(today) && !"DONE".equals(t.getStatus()) && !"CANCELLED".equals(t.getStatus()))
                .count();
                
        long warningTasks = tasks.stream()
                .filter(t -> {
                    if (t.getDeadline() == null || "DONE".equals(t.getStatus()) || "CANCELLED".equals(t.getStatus())) return false;
                    long days = java.time.temporal.ChronoUnit.DAYS.between(today, t.getDeadline().toLocalDate());
                    return days >= 0 && days <= 10;
                })
                .count();
                
        long todoTasks = tasks.stream().filter(t -> "TODO".equals(t.getStatus())).count();
        long doneTasks = tasks.stream().filter(t -> "DONE".equals(t.getStatus())).count();
        long cancelledTasks = tasks.stream().filter(t -> "CANCELLED".equals(t.getStatus())).count();

        List<Map<String, Object>> taskByProject = new java.util.ArrayList<>();
        for (com.doan.backend.entity.Project p : projects) {
            long count = tasks.stream().filter(t -> p.getId().equals(t.getProjectId())).count();
            long totalProgress = tasks.stream().filter(t -> p.getId().equals(t.getProjectId()))
                                      .mapToLong(t -> t.getProgress() != null ? t.getProgress() : 0).sum();
            long progressPercentage = count > 0 ? Math.round((double) totalProgress / count) : 0;
            
            Map<String, Object> pMap = new HashMap<>();
            pMap.put("projectId", p.getId());
            pMap.put("name", p.getName());
            pMap.put("progress", progressPercentage);
            pMap.put("budget", p.getBudget() != null ? p.getBudget() : 5000000L);
            pMap.put("_count", Map.of("_all", count));
            taskByProject.add(pMap);

            String pStatus = "TODO";
            if (count == 0) {
                pTodoCount++;
            } else {
                long tTodo = tasks.stream().filter(t -> p.getId().equals(t.getProjectId()) && "TODO".equals(t.getStatus())).count();
                long tDone = tasks.stream().filter(t -> p.getId().equals(t.getProjectId()) && "DONE".equals(t.getStatus())).count();
                long tCancelled = tasks.stream().filter(t -> p.getId().equals(t.getProjectId()) && "CANCELLED".equals(t.getStatus())).count();

                if (tCancelled == count) {
                    pCancelledCount++;
                    pStatus = "CANCELLED";
                } else if (tDone + tCancelled == count && tDone > 0) {
                    pDoneCount++;
                    pStatus = "DONE";
                } else if (tTodo == count) {
                    pTodoCount++;
                    pStatus = "TODO";
                } else {
                    pInProgressCount++;
                    pStatus = "IN_PROGRESS";
                }
            }
            
            if (!"DONE".equals(pStatus) && !"CANCELLED".equals(pStatus) && p.getDeadline() != null && p.getDeadline().toLocalDate().isBefore(today)) {
                overdueProjects++;
            }
        }

        List<Map<String, Object>> taskCounts = new java.util.ArrayList<>();
        taskCounts.add(createCountMap("TODO", pTodoCount));
        taskCounts.add(createCountMap("IN_PROGRESS", pInProgressCount));
        taskCounts.add(createCountMap("DONE", pDoneCount));
        taskCounts.add(createCountMap("CANCELLED", pCancelledCount));

        Map<String, Object> response = new HashMap<>();
        response.put("taskCounts", taskCounts);
        response.put("overdueTasks", overdueProjects); // Used by Reports.tsx
        response.put("projectCounts", projects.size());
        response.put("taskByProject", taskByProject);
        
        // Restore old keys used by Dashboard.tsx
        response.put("projectCount", projects.size());
        response.put("totalTaskCount", tasks.size());
        long activeTaskCount = tasks.stream().filter(t -> "IN_PROGRESS".equals(t.getStatus())).count();
        response.put("activeTaskCount", activeTaskCount);
        response.put("overdueTaskCount", overdueTasks);
        response.put("warningTaskCount", warningTasks);
        response.put("todoTaskCount", todoTasks);
        response.put("doneTaskCount", doneTasks);
        response.put("cancelledTaskCount", cancelledTasks);

        return ResponseEntity.ok(response);
    }

    private Map<String, Object> createCountMap(String status, long count) {
        Map<String, Object> map = new HashMap<>();
        map.put("status", status);
        map.put("_count", Map.of("_all", count));
        return map;
    }
}
