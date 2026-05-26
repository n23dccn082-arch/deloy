package com.doan.backend.controller;

import com.doan.backend.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private com.doan.backend.repository.ProjectRepository projectRepository;

    @Autowired
    private com.doan.backend.repository.ProjectMemberRepository projectMemberRepository;
    
    @Autowired
    private com.doan.backend.repository.UserRepository userRepository;
    
    @Autowired
    private com.doan.backend.repository.CommentRepository commentRepository;

    @Autowired
    private com.doan.backend.repository.AttachmentRepository attachmentRepository;

    @GetMapping
    public ResponseEntity<?> getAllTasks(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String role) {
        java.util.List<Map<String, Object>> resultList = new java.util.ArrayList<>();
        Iterable<com.doan.backend.entity.Task> allTasks = taskRepository.findAll();
        
        for (com.doan.backend.entity.Task task : allTasks) {
            // Role-based filtering
            if ("MEMBER".equals(role)) {
                if (userId == null || !userId.equals(task.getAssigneeId())) {
                    continue;
                }
            } else if ("TASK_MANAGER".equals(role) || "CLIENT".equals(role)) {
                if (userId != null && task.getProjectId() != null) {
                    boolean isMember = false;
                    for (com.doan.backend.entity.ProjectMember m : projectMemberRepository.findByProjectId(task.getProjectId())) {
                        if (userId.equals(m.getUserId())) {
                            isMember = true;
                            break;
                        }
                    }
                    if (!isMember) {
                        continue;
                    }
                }
            }
            
            Map<String, Object> tMap = new java.util.HashMap<>();
            tMap.put("id", task.getId());
            tMap.put("title", task.getTitle());
            tMap.put("status", task.getStatus());
            tMap.put("priority", task.getPriority());
            tMap.put("progress", task.getProgress() != null ? task.getProgress() : 0);
            tMap.put("deadline", task.getDeadline() != null ? task.getDeadline().toString() : null);
            tMap.put("assigneeId", task.getAssigneeId());
            
            if (task.getProjectId() != null) {
                projectRepository.findById(task.getProjectId()).ifPresent(project -> {
                    tMap.put("project", Map.of("name", project.getName(), "id", project.getId()));
                });
            }
            
            if (task.getAssigneeId() != null) {
                userRepository.findById(task.getAssigneeId()).ifPresent(user -> {
                    tMap.put("assignee", Map.of("name", user.getName(), "id", user.getId()));
                });
            }
            
            long commentCount = commentRepository.findByTaskId(task.getId()).size();
            tMap.put("_count", Map.of("comments", commentCount));
            
            resultList.add(tMap);
        }
        return ResponseEntity.ok(resultList);
    }

    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody Map<String, String> payload) {
        String title = payload.get("title");
        if (title == null || title.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Title is required"));
        }

        com.doan.backend.entity.Task task = new com.doan.backend.entity.Task();
        task.setTitle(title);
        task.setDescription(payload.getOrDefault("description", ""));
        task.setPriority(payload.getOrDefault("priority", "MEDIUM"));
        task.setStatus(payload.getOrDefault("status", "TODO"));
        task.setProgress(0);
        
        String projectId = payload.get("projectId");
        if (projectId != null && !projectId.isEmpty()) {
            task.setProjectId(projectId);
        }

        String assigneeId = payload.get("assigneeId");
        if (assigneeId != null && !assigneeId.isEmpty()) {
            task.setAssigneeId(assigneeId);
        }

        String d = payload.get("deadline");
        if (d != null && !d.isEmpty()) {
            try {
                if (d.length() == 10) {
                    task.setDeadline(java.time.LocalDate.parse(d).atStartOfDay());
                } else {
                    task.setDeadline(java.time.LocalDateTime.parse(d));
                }
            } catch(Exception e) {}
        }
        
        task.setCreatedAt(java.time.LocalDateTime.now());
        task.setUpdatedAt(java.time.LocalDateTime.now());
        
        com.doan.backend.entity.Task savedTask = taskRepository.save(task);
        return ResponseEntity.ok(savedTask);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTask(
            @PathVariable String id,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String role) {
        var taskOpt = taskRepository.findById(id);
        if (taskOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Task not found"));
        }
        com.doan.backend.entity.Task task = taskOpt.get();
        
        // Access control check
        if ("MEMBER".equals(role)) {
            if (userId == null || !userId.equals(task.getAssigneeId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }
        } else if ("TASK_MANAGER".equals(role) || "CLIENT".equals(role)) {
            if (userId != null && task.getProjectId() != null) {
                boolean isMember = false;
                for (com.doan.backend.entity.ProjectMember m : projectMemberRepository.findByProjectId(task.getProjectId())) {
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
        
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("id", task.getId());
        result.put("title", task.getTitle());
        result.put("description", task.getDescription());
        result.put("status", task.getStatus());
        result.put("priority", task.getPriority());
        result.put("progress", task.getProgress() != null ? task.getProgress() : 0);
        result.put("deadline", task.getDeadline() != null ? task.getDeadline().toString() : null);
        result.put("projectId", task.getProjectId());
        
        if (task.getProjectId() != null) {
            projectRepository.findById(task.getProjectId()).ifPresent(project -> {
                result.put("project", Map.of("id", project.getId(), "name", project.getName(), "createdById", project.getCreatedById()));
            });
        }
        
        if (task.getAssigneeId() != null) {
            userRepository.findById(task.getAssigneeId()).ifPresent(user -> {
                result.put("assignee", Map.of("id", user.getId(), "name", user.getName(), "email", user.getEmail()));
            });
        } else {
            result.put("assignee", null);
        }
        
        // Fetch comments
        java.util.List<Map<String, Object>> commentsList = new java.util.ArrayList<>();
        commentRepository.findByTaskId(id).forEach(c -> {
            Map<String, Object> cMap = new java.util.HashMap<>();
            cMap.put("id", c.getId());
            cMap.put("content", c.getContent());
            cMap.put("createdAt", c.getCreatedAt() != null ? c.getCreatedAt().toString() : null);
            userRepository.findById(c.getUserId()).ifPresent(u -> {
                cMap.put("user", Map.of("id", u.getId(), "name", u.getName(), "email", u.getEmail()));
            });
            commentsList.add(cMap);
        });
        result.put("comments", commentsList);
        
        java.util.List<Map<String, Object>> attachmentsList = new java.util.ArrayList<>();
        attachmentRepository.findByTaskId(id).forEach(a -> {
            Map<String, Object> aMap = new java.util.HashMap<>();
            aMap.put("id", a.getId());
            aMap.put("filename", a.getFilename());
            aMap.put("url", a.getUrl());
            aMap.put("uploadedAt", a.getUploadedAt() != null ? a.getUploadedAt().toString() : null);
            if (a.getUserId() != null) {
                userRepository.findById(a.getUserId()).ifPresent(u -> {
                    aMap.put("user", Map.of("id", u.getId(), "name", u.getName(), "email", u.getEmail()));
                });
            }
            attachmentsList.add(aMap);
        });
        result.put("attachments", attachmentsList);
        
        return ResponseEntity.ok(result);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(@PathVariable String id, @RequestBody Map<String, String> updates) {
        var taskOpt = taskRepository.findById(id);
        if (taskOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Task not found"));
        }
        com.doan.backend.entity.Task task = taskOpt.get();
        
        if (updates.containsKey("status")) task.setStatus(updates.get("status"));
        if (updates.containsKey("priority")) task.setPriority(updates.get("priority"));
        if (updates.containsKey("progress")) {
            try {
                int p = Integer.parseInt(updates.get("progress"));
                task.setProgress(p);
                if (p == 100) {
                    task.setStatus("DONE");
                } else if (p > 0 && "TODO".equals(task.getStatus())) {
                    task.setStatus("IN_PROGRESS");
                }
            } catch (Exception e) {}
        }

        // Ensure consistency
        if ("DONE".equals(task.getStatus())) {
            task.setProgress(100);
        } else if ("TODO".equals(task.getStatus())) {
            task.setProgress(0);
        }
        if (updates.containsKey("assigneeId")) {
            String aId = updates.get("assigneeId");
            task.setAssigneeId(aId == null || aId.isEmpty() ? null : aId);
        }
        if (updates.containsKey("deadline")) {
            String d = updates.get("deadline");
            if (d != null && !d.isEmpty()) {
                // simple parse if it's yyyy-mm-dd
                try {
                    if (d.length() == 10) {
                        task.setDeadline(java.time.LocalDate.parse(d).atStartOfDay());
                    } else {
                        task.setDeadline(java.time.LocalDateTime.parse(d));
                    }
                } catch(Exception e) {}
            } else {
                task.setDeadline(null);
            }
        }
        
        task.setUpdatedAt(java.time.LocalDateTime.now());
        taskRepository.save(task);
        
        return ResponseEntity.ok(Map.of("message", "Task updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable String id) {
        if (!taskRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "Task not found"));
        }
        
        taskRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Task deleted successfully"));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String content = payload.get("content");
        String userId = payload.get("userId");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Content is required"));
        }
        
        com.doan.backend.entity.Comment comment = new com.doan.backend.entity.Comment();
        comment.setTaskId(id);
        comment.setContent(content);
        comment.setUserId(userId);
        comment.setCreatedAt(java.time.LocalDateTime.now());
        
        com.doan.backend.entity.Comment saved = commentRepository.save(comment);
        
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("id", saved.getId());
        result.put("content", saved.getContent());
        result.put("createdAt", saved.getCreatedAt().toString());
        if (userId != null) {
            userRepository.findById(userId).ifPresent(u -> {
                result.put("user", Map.of("id", u.getId(), "name", u.getName(), "email", u.getEmail()));
            });
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/attachments")
    public ResponseEntity<?> addAttachment(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String filename = payload.get("filename");
        String url = payload.get("url");
        String userId = payload.get("userId");
        
        if (filename == null || filename.trim().isEmpty() || url == null || url.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Filename and url are required"));
        }
        
        com.doan.backend.entity.Attachment attachment = new com.doan.backend.entity.Attachment();
        attachment.setTaskId(id);
        attachment.setFilename(filename);
        attachment.setUrl(url);
        attachment.setUserId(userId);
        attachment.setUploadedAt(java.time.LocalDateTime.now());
        
        com.doan.backend.entity.Attachment saved = attachmentRepository.save(attachment);
        
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("id", saved.getId());
        result.put("filename", saved.getFilename());
        result.put("url", saved.getUrl());
        result.put("uploadedAt", saved.getUploadedAt().toString());
        if (userId != null) {
            userRepository.findById(userId).ifPresent(u -> {
                result.put("user", Map.of("id", u.getId(), "name", u.getName(), "email", u.getEmail()));
            });
        }
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable String commentId) {
        if (!commentRepository.existsById(commentId)) {
            return ResponseEntity.status(404).body(Map.of("error", "Comment not found"));
        }
        commentRepository.deleteById(commentId);
        return ResponseEntity.ok(Map.of("message", "Comment deleted successfully"));
    }

    @DeleteMapping("/attachments/{attachmentId}")
    public ResponseEntity<?> deleteAttachment(@PathVariable String attachmentId) {
        if (!attachmentRepository.existsById(attachmentId)) {
            return ResponseEntity.status(404).body(Map.of("error", "Attachment not found"));
        }
        attachmentRepository.deleteById(attachmentId);
        return ResponseEntity.ok(Map.of("message", "Attachment deleted successfully"));
    }
}
