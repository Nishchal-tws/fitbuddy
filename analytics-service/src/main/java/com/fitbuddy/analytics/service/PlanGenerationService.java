package com.fitbuddy.analytics.service;

import com.fitbuddy.analytics.entity.*;
import com.fitbuddy.analytics.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlanGenerationService {
    
    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final WorkoutRepository workoutRepository;
    
    /**
     * Scheduled task that runs every night at 2 AM to generate plans for new goals
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void generatePlansForNewGoals() {
        log.info("=== Starting Plan Generation for New Goals ===");
        
        try {
            // Find all goals that don't have a corresponding custom plan yet
            List<Goal> goalsWithoutPlans = findGoalsWithoutPlans();
            
            log.info("Found {} goals without plans", goalsWithoutPlans.size());
            
            for (Goal goal : goalsWithoutPlans) {
                try {
                    generatePlanForGoal(goal);
                } catch (Exception e) {
                    log.error("Failed to generate plan for goal {}: {}", goal.getId(), e.getMessage());
                }
            }
            
            log.info("=== Plan Generation Complete ===");
            
        } catch (Exception e) {
            log.error("Error during plan generation: {}", e.getMessage());
        }
    }
    
    /**
     * Generate a custom workout plan for a specific goal by ID
     */
    public void generatePlanForSpecificGoal(Long goalId) {
        Goal goal = goalRepository.findById(goalId).orElse(null);
        if (goal == null) {
            log.warn("Goal not found: {}", goalId);
            return;
        }
        
        // Check if user already has a custom plan
        List<Workout> existingPlans = workoutRepository.findUserPlans(goal.getOwnerId());
        if (!existingPlans.isEmpty()) {
            log.info("User {} already has a custom plan, skipping generation", goal.getOwnerId());
            return;
        }
        
        generatePlanForGoal(goal);
    }
    
    /**
     * Generate a custom workout plan for a specific goal
     */
    private void generatePlanForGoal(Goal goal) {
        log.info("Generating plan for goal: {} (User: {})", goal.getTitle(), goal.getOwnerId());
        
        // Get user details
        User user = userRepository.findById(goal.getOwnerId()).orElse(null);
        if (user == null) {
            log.warn("User not found for goal: {}", goal.getOwnerId());
            return;
        }
        
        // Analyze goal to determine plan characteristics
        PlanCharacteristics characteristics = analyzeGoal(goal, user);
        
        // Create the workout plan
        Workout plan = createWorkoutPlan(goal, characteristics);
        
        // Save the plan
        Workout savedPlan = workoutRepository.save(plan);
        
        log.info("Generated plan: {} for user: {}", savedPlan.getTitle(), user.getEmail());
    }
    
    /**
     * Find goals that don't have corresponding custom workout plans
     */
    private List<Goal> findGoalsWithoutPlans() {
        return goalRepository.findAll().stream()
            .filter(goal -> {
                // Check if there's already a custom plan for this user (owner_id = user_id)
                List<Workout> existingPlans = workoutRepository.findUserPlans(goal.getOwnerId());
                return existingPlans.isEmpty();
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Analyze a goal and user to determine plan characteristics
     */
    private PlanCharacteristics analyzeGoal(Goal goal, User user) {
        String goalTitle = goal.getTitle().toLowerCase();
        String userLevel = user.getExperienceLevel() != null ? user.getExperienceLevel().toLowerCase() : "beginner";
        
        PlanCharacteristics characteristics = new PlanCharacteristics();
        
        // Determine plan type based on goal keywords
        if (goalTitle.contains("lose") || goalTitle.contains("weight") || goalTitle.contains("fat")) {
            characteristics.setPlanType("weight_loss");
            characteristics.setFocus("cardio");
            characteristics.setDurationDays(30);
        } else if (goalTitle.contains("muscle") || goalTitle.contains("strength") || goalTitle.contains("build")) {
            characteristics.setPlanType("muscle_building");
            characteristics.setFocus("strength");
            characteristics.setDurationDays(60);
        } else if (goalTitle.contains("endurance") || goalTitle.contains("stamina")) {
            characteristics.setPlanType("endurance");
            characteristics.setFocus("cardio");
            characteristics.setDurationDays(45);
        } else {
            // Default general fitness plan
            characteristics.setPlanType("general_fitness");
            characteristics.setFocus("mixed");
            characteristics.setDurationDays(30);
        }
        
        // Set difficulty based on user experience level
        characteristics.setDifficulty(userLevel);
        
        // Adjust duration based on user experience
        if ("beginner".equals(userLevel)) {
            characteristics.setDurationDays(Math.min(characteristics.getDurationDays(), 21));
        } else if ("advanced".equals(userLevel)) {
            characteristics.setDurationDays(Math.max(characteristics.getDurationDays(), 45));
        }
        
        return characteristics;
    }
    
    /**
     * Create a workout plan based on characteristics
     */
    private Workout createWorkoutPlan(Goal goal, PlanCharacteristics characteristics) {
        Workout plan = new Workout();
        
        // Generate plan title
        String title = generatePlanTitle(goal, characteristics);
        plan.setTitle(title);
        
        // Generate plan description
        String description = generatePlanDescription(goal, characteristics);
        plan.setDescription(description);
        
        plan.setCreatedAt(LocalDateTime.now());
        plan.setLevel(characteristics.getDifficulty());
        plan.setDurationDays(characteristics.getDurationDays());
        plan.setOwnerId(goal.getOwnerId()); // This makes it a custom plan for the user
        
        return plan;
    }
    
    /**
     * Generate a personalized plan title
     */
    private String generatePlanTitle(Goal goal, PlanCharacteristics characteristics) {
        String userLevel = characteristics.getDifficulty();
        String planType = characteristics.getPlanType();
        int duration = characteristics.getDurationDays();
        
        String levelStr = userLevel.substring(0, 1).toUpperCase() + userLevel.substring(1);
        String typeStr = planType.replace("_", " ");
        typeStr = typeStr.substring(0, 1).toUpperCase() + typeStr.substring(1);
        
        return String.format("%s %s Plan - %d Days", levelStr, typeStr, duration);
    }
    
    /**
     * Generate a personalized plan description
     */
    private String generatePlanDescription(Goal goal, PlanCharacteristics characteristics) {
        String focus = characteristics.getFocus();
        int duration = characteristics.getDurationDays();
        String difficulty = characteristics.getDifficulty();
        
        return String.format(
            "A personalized %s-day %s workout plan designed to help you achieve your goal: '%s'. " +
            "This plan focuses on %s training and is tailored for %s level fitness. " +
            "The workouts will gradually increase in intensity to help you build strength, endurance, and confidence.",
            duration, focus, goal.getTitle(), focus, difficulty
        );
    }
    
    /**
     * Inner class to hold plan characteristics
     */
    private static class PlanCharacteristics {
        private String planType;
        private String focus;
        private String difficulty;
        private int durationDays;
        
        // Getters and setters
        public String getPlanType() { return planType; }
        public void setPlanType(String planType) { this.planType = planType; }
        
        public String getFocus() { return focus; }
        public void setFocus(String focus) { this.focus = focus; }
        
        public String getDifficulty() { return difficulty; }
        public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
        
        public int getDurationDays() { return durationDays; }
        public void setDurationDays(int durationDays) { this.durationDays = durationDays; }
    }
}
