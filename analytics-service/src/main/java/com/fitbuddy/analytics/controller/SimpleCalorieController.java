package com.fitbuddy.analytics.controller;

import com.fitbuddy.analytics.service.SimpleCalorieService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics/calories")
@RequiredArgsConstructor
@Slf4j
public class SimpleCalorieController {

    private final SimpleCalorieService simpleCalorieService;

    /**
     * Calculate calories for a specific workout
     * This endpoint can be called by FastAPI asynchronously
     */
    @PostMapping("/calculate")
    public ResponseEntity<Map<String, Object>> calculateCalories(
            @RequestParam Long workoutId,
            @RequestParam Integer durationMinutes) {
        
        log.info("Received calorie calculation request for workout: {} duration: {} minutes", workoutId, durationMinutes);
        
        try {
            Map<String, Object> result = simpleCalorieService.calculateCaloriesForWorkout(workoutId, durationMinutes);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error calculating calories for workout {}: {}", workoutId, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to calculate calories");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Get daily calorie summary for a user
     * This would integrate with FastAPI workout logs
     */
    @GetMapping("/daily-summary/{userId}")
    public ResponseEntity<Map<String, Object>> getDailyCalorieSummary(
            @PathVariable Long userId,
            @RequestParam(required = false) String date) {
        
        LocalDate targetDate = date != null ? LocalDate.parse(date) : LocalDate.now();
        log.info("Getting daily calorie summary for user: {} on date: {}", userId, targetDate);
        
        try {
            Map<String, Object> summary = simpleCalorieService.getDailyCalorieSummary(userId, targetDate);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            log.error("Error getting daily calorie summary for user {}: {}", userId, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get daily calorie summary");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> healthResponse = new HashMap<>();
        healthResponse.put("status", "healthy");
        healthResponse.put("service", "simple-calorie-service");
        return ResponseEntity.ok(healthResponse);
    }
}
