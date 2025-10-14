package com.fitbuddy.analytics.service;

import com.fitbuddy.analytics.entity.Workout;
import com.fitbuddy.analytics.repository.WorkoutRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SimpleCalorieService {
    
    private final WorkoutRepository workoutRepository;
    
    // Simple MET values for common exercises
    private static final Map<String, Double> MET_VALUES = new HashMap<>();
    
    static {
        // Cardio exercises
        MET_VALUES.put("running", 8.0);
        MET_VALUES.put("cycling", 6.0);
        MET_VALUES.put("swimming", 7.0);
        MET_VALUES.put("jumping", 8.5);
        MET_VALUES.put("rowing", 7.0);
        MET_VALUES.put("elliptical", 5.0);
        MET_VALUES.put("stairs", 8.0);
        MET_VALUES.put("dancing", 4.5);
        MET_VALUES.put("boxing", 8.0);
        MET_VALUES.put("hiit", 9.0);
        
        // Strength exercises
        MET_VALUES.put("push", 3.5);
        MET_VALUES.put("pull", 4.0);
        MET_VALUES.put("squat", 4.0);
        MET_VALUES.put("deadlift", 5.0);
        MET_VALUES.put("bench", 3.5);
        MET_VALUES.put("press", 3.5);
        MET_VALUES.put("row", 4.0);
        MET_VALUES.put("lunge", 4.0);
        MET_VALUES.put("plank", 3.0);
        MET_VALUES.put("dip", 4.0);
        
        // Flexibility exercises
        MET_VALUES.put("yoga", 2.5);
        MET_VALUES.put("stretch", 2.0);
        MET_VALUES.put("pilates", 3.0);
        MET_VALUES.put("tai", 2.5);
        MET_VALUES.put("dynamic", 3.0);
        MET_VALUES.put("static", 2.0);
        MET_VALUES.put("foam", 2.0);
        MET_VALUES.put("mobility", 2.5);
        MET_VALUES.put("breathing", 1.5);
        MET_VALUES.put("meditation", 1.0);
    }
    
    /**
     * Calculate calories burned for a workout using simple assumptions
     */
    public Map<String, Object> calculateCaloriesForWorkout(Long workoutId, Integer durationMinutes) {
        log.info("Calculating calories for workout: {} with duration: {} minutes", workoutId, durationMinutes);
        
        Workout workout = workoutRepository.findById(workoutId)
            .orElseThrow(() -> new RuntimeException("Workout not found: " + workoutId));
        
        // Simple assumptions: average person 70kg, moderate intensity
        double averageWeight = 70.0; // kg
        double metValue = getMetValueForWorkout(workout);
        double durationHours = durationMinutes / 60.0;
        
        // Basic formula: Calories = MET × Weight(kg) × Duration(hours)
        double caloriesBurned = metValue * averageWeight * durationHours;
        
        Map<String, Object> result = new HashMap<>();
        result.put("workoutId", workoutId);
        result.put("workoutTitle", workout.getTitle());
        result.put("durationMinutes", durationMinutes);
        result.put("metValue", metValue);
        result.put("caloriesBurned", Math.round(caloriesBurned * 100.0) / 100.0);
        result.put("assumptions", new HashMap<String, Object>() {{
            put("weight", averageWeight);
            put("intensity", "moderate");
        }});
        
        log.info("Calculated {} calories for workout: {}", caloriesBurned, workout.getTitle());
        return result;
    }
    
    /**
     * Get daily calorie summary for a user (simplified)
     */
    public Map<String, Object> getDailyCalorieSummary(Long userId, LocalDate date) {
        log.info("Getting daily calorie summary for user: {} on date: {}", userId, date);
        
        // For now, return a simple summary
        // In a real implementation, you'd query workout logs from FastAPI
        Map<String, Object> summary = new HashMap<>();
        summary.put("userId", userId);
        summary.put("date", date);
        summary.put("totalCaloriesBurned", 0.0);
        summary.put("totalWorkoutMinutes", 0);
        summary.put("workoutCount", 0);
        summary.put("message", "No workout data available - this would integrate with FastAPI workout logs");
        
        return summary;
    }
    
    /**
     * Get MET value for a workout based on its title/description
     */
    private double getMetValueForWorkout(Workout workout) {
        String title = workout.getTitle().toLowerCase();
        String description = workout.getDescription() != null ? workout.getDescription().toLowerCase() : "";
        
        // Check for specific exercise keywords
        for (Map.Entry<String, Double> entry : MET_VALUES.entrySet()) {
            if (title.contains(entry.getKey()) || description.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        
        // Default based on workout level
        if (workout.getLevel() != null) {
            switch (workout.getLevel().toLowerCase()) {
                case "beginner": return 3.0;
                case "intermediate": return 4.5;
                case "advanced": return 6.0;
                default: return 4.0;
            }
        }
        
        return 4.0; // Default moderate intensity
    }
}
