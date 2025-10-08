package com.fitbuddy.analytics.controller;

import com.fitbuddy.analytics.dto.GoalNotificationRequest;
import com.fitbuddy.analytics.entity.Workout;
import com.fitbuddy.analytics.repository.WorkoutRepository;
import com.fitbuddy.analytics.service.PlanGenerationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Slf4j
public class PlanController {
    
    private final PlanGenerationService planGenerationService;
    private final WorkoutRepository workoutRepository;
    
    /**
     * Manually trigger plan generation for new goals
     */
    @PostMapping("/generate-plans")
    public ResponseEntity<String> generatePlans(@RequestBody(required = false) GoalNotificationRequest request) {
        try {
            if (request != null && request.getGoalId() != null) {
                // Generate plan for specific goal
                log.info("Generating plan for specific goal: {}", request.getGoalId());
                planGenerationService.generatePlanForSpecificGoal(request.getGoalId());
                return ResponseEntity.ok("Plan generated for goal " + request.getGoalId());
            } else {
                // Generate plans for all new goals
                planGenerationService.generatePlansForNewGoals();
                return ResponseEntity.ok("Plan generation completed successfully");
            }
        } catch (Exception e) {
            log.error("Error during plan generation: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                .body("Error during plan generation: " + e.getMessage());
        }
    }
    
    /**
     * Get all system workout plans
     */
    @GetMapping("/system-plans")
    public ResponseEntity<List<Workout>> getSystemPlans() {
        List<Workout> plans = workoutRepository.findSystemPlans();
        return ResponseEntity.ok(plans);
    }
    
    /**
     * Seed some sample system workout plans
     */
    @PostMapping("/seed-plans")
    public ResponseEntity<String> seedSystemPlans() {
        try {
            createSamplePlans();
            return ResponseEntity.ok("Sample plans created successfully");
        } catch (Exception e) {
            log.error("Error seeding plans: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                .body("Error seeding plans: " + e.getMessage());
        }
    }
    
    /**
     * Create sample system workout plans
     */
    private void createSamplePlans() {
        // Check if plans already exist
        List<Workout> existingPlans = workoutRepository.findSystemPlans();
        if (!existingPlans.isEmpty()) {
            log.info("System plans already exist, skipping seed");
            return;
        }
        
        // Beginner Plans
        createPlan("30-Day Beginner Cardio", 
            "A gentle introduction to cardio workouts perfect for beginners. Includes walking, light jogging, and basic bodyweight exercises.",
            "beginner", 30);
            
        createPlan("Beginner Strength Training", 
            "Basic strength training routine focusing on fundamental movements with bodyweight and light weights.",
            "beginner", 28);
            
        // Intermediate Plans
        createPlan("45-Day Intermediate HIIT", 
            "High-intensity interval training program for those ready to step up their fitness game. Mix of cardio and strength.",
            "intermediate", 45);
            
        createPlan("Intermediate Weight Training", 
            "Structured weight training program targeting all major muscle groups with progressive overload.",
            "intermediate", 60);
            
        // Advanced Plans
        createPlan("60-Day Advanced CrossFit", 
            "Intensive CrossFit-style training combining strength, endurance, and functional movements.",
            "advanced", 60);
            
        createPlan("Advanced Powerlifting Program", 
            "Specialized powerlifting program focusing on squat, bench press, and deadlift with accessory work.",
            "advanced", 90);
            
        log.info("Created {} sample system plans", 6);
    }
    
    private void createPlan(String title, String description, String level, int durationDays) {
        Workout plan = new Workout();
        plan.setTitle(title);
        plan.setDescription(description);
        plan.setLevel(level);
        plan.setDurationDays(durationDays);
        plan.setCreatedAt(LocalDateTime.now());
        plan.setOwnerId(null); // System plan
        
        workoutRepository.save(plan);
    }
}
