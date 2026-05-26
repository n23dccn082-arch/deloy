package com.doan.backend.controller;

import com.doan.backend.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private com.doan.backend.repository.ProjectMemberRepository projectMemberRepository;

    @GetMapping
    public ResponseEntity<?> getAllProjects(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String role) {
        java.util.List<Map<String, Object>> result = new java.util.ArrayList<>();
        projectRepository.findAll().forEach(project -> {
            boolean hasAccess = true;
            if ("TASK_MANAGER".equals(role) || "MEMBER".equals(role) || "CLIENT".equals(role)) {
                if (userId != null) {
                    boolean isMember = false;
                    for (com.doan.backend.entity.ProjectMember m : projectMemberRepository.findByProjectId(project.getId())) {
                        if (userId.equals(m.getUserId())) {
                            isMember = true;
                            break;
                        }
                    }
                    if (!isMember) {
                        hasAccess = false;
                    }
                }
            }
            if (!hasAccess) return;
            
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", project.getId());
            map.put("name", project.getName());
            map.put("description", project.getDescription());
            map.put("priority", project.getPriority());
            map.put("budget", project.getBudget() != null ? project.getBudget() : 5000000L);
            map.put("deadline", project.getDeadline() != null ? project.getDeadline().toString() : null);
            map.put("createdById", project.getCreatedById());
            
            userRepository.findById(project.getCreatedById() != null ? project.getCreatedById() : "").ifPresentOrElse(
                user -> map.put("creator", Map.of("name", user.getName(), "email", user.getEmail())),
                () -> map.put("creator", Map.of("name", "Admin"))
            );
            
            java.util.List<Object> members = new java.util.ArrayList<>();
            projectMemberRepository.findByProjectId(project.getId()).forEach(m -> members.add(m));
            map.put("members", members);
            
            java.util.List<Object> tasks = new java.util.ArrayList<>();
            taskRepository.findByProjectId(project.getId()).forEach(t -> tasks.add(t));
            map.put("tasks", tasks);
            
            result.add(map);
        });
        return ResponseEntity.ok(result);
    }

    @Autowired
    private com.doan.backend.repository.TaskRepository taskRepository;

    @Autowired
    private com.doan.backend.repository.UserRepository userRepository;

    @GetMapping("/{id}")
    public ResponseEntity<?> getProjectById(
            @PathVariable String id,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String role) {
        var projectOpt = projectRepository.findById(id);
        if (projectOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Project not found"));
        }
        
        // Access control check
        if ("TASK_MANAGER".equals(role) || "MEMBER".equals(role) || "CLIENT".equals(role)) {
            if (userId != null) {
                boolean isMember = false;
                for (com.doan.backend.entity.ProjectMember m : projectMemberRepository.findByProjectId(id)) {
                    if (userId.equals(m.getUserId())) {
                        isMember = true;
                        break;
                    }
                }
                if (!isMember) {
                    return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
                }
            }
        }
        
        com.doan.backend.entity.Project project = projectOpt.get();
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("id", project.getId());
        result.put("name", project.getName());
        result.put("description", project.getDescription());
        result.put("priority", project.getPriority());
        result.put("budget", project.getBudget() != null ? project.getBudget() : 5000000L);
        result.put("deadline", project.getDeadline() != null ? project.getDeadline().toString() : null);
        result.put("createdById", project.getCreatedById());
        
        java.util.List<Map<String, Object>> membersList = new java.util.ArrayList<>();
        projectMemberRepository.findByProjectId(id).forEach(member -> {
            Map<String, Object> mMap = new java.util.HashMap<>();
            mMap.put("id", member.getId());
            mMap.put("role", member.getRole());
            
            userRepository.findById(member.getUserId()).ifPresentOrElse(user -> {
                mMap.put("user", Map.of("id", user.getId(), "name", user.getName(), "email", user.getEmail(), "role", user.getRole()));
            }, () -> {
                mMap.put("user", Map.of("id", member.getUserId(), "name", "Unknown User", "email", "", "role", "UNKNOWN"));
            });
            membersList.add(mMap);
        });
        result.put("members", membersList);
        
        java.util.List<Map<String, Object>> taskList = new java.util.ArrayList<>();
        taskRepository.findByProjectId(id).forEach(task -> {
            Map<String, Object> tMap = new java.util.HashMap<>();
            tMap.put("id", task.getId());
            tMap.put("title", task.getTitle());
            tMap.put("status", task.getStatus());
            tMap.put("priority", task.getPriority());
            tMap.put("progress", task.getProgress() != null ? task.getProgress() : 0);
            tMap.put("deadline", task.getDeadline() != null ? task.getDeadline().toString() : null);
            tMap.put("assigneeId", task.getAssigneeId());
            
            if (task.getAssigneeId() != null) {
                userRepository.findById(task.getAssigneeId()).ifPresentOrElse(user -> {
                    tMap.put("assignee", Map.of("name", user.getName(), "email", user.getEmail(), "id", user.getId()));
                }, () -> {
                    tMap.put("assignee", Map.of("name", "Unknown User"));
                });
            } else {
                tMap.put("assignee", null);
            }
            
            // To prevent crash in TaskTable:
            tMap.put("_count", Map.of("comments", 0));
            
            taskList.add(tMap);
        });
        result.put("tasks", taskList);

        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody Map<String, String> payload) {
        com.doan.backend.entity.Project project = new com.doan.backend.entity.Project();
        project.setName(payload.getOrDefault("name", "Dự án mới"));
        project.setDescription(payload.getOrDefault("description", ""));
        project.setPriority(payload.getOrDefault("priority", "MEDIUM"));
        if (payload.containsKey("budget")) {
            try {
                project.setBudget(Long.parseLong(payload.get("budget")));
            } catch (Exception e) {}
        }
        String d = payload.get("deadline");
        if (d != null && !d.isEmpty()) {
            try {
                if (d.length() == 10) project.setDeadline(java.time.LocalDate.parse(d).atStartOfDay());
                else project.setDeadline(java.time.LocalDateTime.parse(d));
            } catch(Exception e) {}
        }
        project.setCreatedById(payload.getOrDefault("createdById", "admin-id")); // Fallback if no auth token is provided
        project.setCreatedAt(java.time.LocalDateTime.now());
        project.setUpdatedAt(java.time.LocalDateTime.now());
        com.doan.backend.entity.Project saved = projectRepository.save(project);
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateProject(@PathVariable String id, @RequestBody Map<String, String> updates) {
        var projectOpt = projectRepository.findById(id);
        if (projectOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Project not found"));
        }
        com.doan.backend.entity.Project project = projectOpt.get();
        if (updates.containsKey("name")) project.setName(updates.get("name"));
        if (updates.containsKey("description")) project.setDescription(updates.get("description"));
        if (updates.containsKey("priority")) project.setPriority(updates.get("priority"));
        if (updates.containsKey("budget")) {
            try {
                project.setBudget(Long.parseLong(updates.get("budget")));
            } catch (Exception e) {
                project.setBudget(0L);
            }
        }
        if (updates.containsKey("deadline")) {
            String d = updates.get("deadline");
            if (d != null && !d.isEmpty()) {
                try {
                    if (d.length() == 10) project.setDeadline(java.time.LocalDate.parse(d).atStartOfDay());
                    else project.setDeadline(java.time.LocalDateTime.parse(d));
                } catch(Exception e) {}
            } else {
                project.setDeadline(null);
            }
        }
        project.setUpdatedAt(java.time.LocalDateTime.now());
        projectRepository.save(project);
        return ResponseEntity.ok(Map.of("message", "Project updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable String id) {
        if (!projectRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "Project not found"));
        }
        
        projectRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Project deleted successfully"));
    }

    @PostMapping("/{projectId}/members")
    public ResponseEntity<?> addMember(@PathVariable String projectId, @RequestBody Map<String, String> payload) {
        if (!projectRepository.existsById(projectId)) {
            return ResponseEntity.status(404).body(Map.of("error", "Project not found"));
        }
        
        String userId = payload.get("userId");
        String role = payload.getOrDefault("role", "member");
        
        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "UserId is required"));
        }
        
        com.doan.backend.entity.ProjectMember member = new com.doan.backend.entity.ProjectMember();
        member.setProjectId(projectId);
        member.setUserId(userId);
        member.setRole(role);
        member.setJoinedAt(java.time.LocalDateTime.now());
        
        com.doan.backend.entity.ProjectMember savedMember = projectMemberRepository.save(member);
        
        return ResponseEntity.ok(Map.of("message", "Member added successfully", "member", savedMember));
    }

    @DeleteMapping("/{projectId}/members")
    public ResponseEntity<?> removeMember(@PathVariable String projectId, @RequestBody Map<String, String> payload) {
        String userId = payload.get("userId");
        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "UserId is required"));
        }

        var members = projectMemberRepository.findByProjectId(projectId);
        var memberToRemove = members.stream()
                .filter(m -> m.getUserId().equals(userId))
                .findFirst();

        if (memberToRemove.isPresent()) {
            projectMemberRepository.deleteById(memberToRemove.get().getId());
            return ResponseEntity.ok(Map.of("message", "Member removed successfully"));
        }

        return ResponseEntity.status(404).body(Map.of("error", "Member not found in project"));
    }
}
