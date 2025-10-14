package com.fitbuddy.analytics.service;

import com.fitbuddy.analytics.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageListenerService {
    
    private final RedisTemplate<String, Object> redisTemplate;
    private final SimpleCalorieService calorieService;
    
    @RabbitListener(queues = RabbitMQConfig.WORKOUT_PROCESSING_QUEUE)
    public void handleWorkoutProcessing(Map<String, Object> message) {
        log.info("Received workout processing message: {}", message);
        
        try {
            Integer workoutId = (Integer) message.get("workout_id");
            Integer userId = (Integer) message.get("user_id");
            String messageType = (String) message.get("type");
            
            if ("workout_processing".equals(messageType) && workoutId != null && userId != null) {
                // Process workout statistics
                processWorkoutStatistics(workoutId.longValue(), userId);
            }
            
        } catch (Exception e) {
            log.error("Error processing workout message: {}", e.getMessage());
        }
    }
    
    @RabbitListener(queues = RabbitMQConfig.PROGRESS_ANALYSIS_QUEUE)
    public void handleProgressAnalysis(Map<String, Object> message) {
        log.info("Received progress analysis message: {}", message);
        
        try {
            Integer userId = (Integer) message.get("user_id");
            String analysisType = (String) message.get("analysis_type");
            String period = (String) message.get("period");
            String messageType = (String) message.get("type");
            
            if ("progress_analysis".equals(messageType) && userId != null) {
                // Process progress analysis
                processProgressAnalysis(userId, analysisType, period);
            }
            
        } catch (Exception e) {
            log.error("Error processing progress analysis message: {}", e.getMessage());
        }
    }
    
    @RabbitListener(queues = RabbitMQConfig.REPORT_GENERATION_QUEUE)
    public void handleReportGeneration(Map<String, Object> message) {
        log.info("Received report generation message: {}", message);
        
        try {
            Integer userId = (Integer) message.get("user_id");
            String reportType = (String) message.get("report_type");
            String messageType = (String) message.get("type");
            
            if ("report_generation".equals(messageType) && userId != null) {
                // Process report generation
                processReportGeneration(userId, reportType);
            }
            
        } catch (Exception e) {
            log.error("Error processing report generation message: {}", e.getMessage());
        }
    }
    
    @RabbitListener(queues = RabbitMQConfig.GOAL_REMINDER_QUEUE)
    public void handleGoalReminder(Map<String, Object> message) {
        log.info("Received goal reminder message: {}", message);
        
        try {
            Integer userId = (Integer) message.get("user_id");
            Integer goalId = (Integer) message.get("goal_id");
            String reminderType = (String) message.get("reminder_type");
            String messageType = (String) message.get("type");
            
            if ("goal_reminder".equals(messageType) && userId != null) {
                // Process goal reminder
                processGoalReminder(userId, goalId, reminderType);
            }
            
        } catch (Exception e) {
            log.error("Error processing goal reminder message: {}", e.getMessage());
        }
    }
    
    @RabbitListener(queues = RabbitMQConfig.BATCH_PROCESSING_QUEUE)
    public void handleBatchProcessing(Map<String, Object> message) {
        log.info("Received batch processing message: {}", message);
        
        try {
            Integer userId = (Integer) message.get("user_id");
            String startDate = (String) message.get("start_date");
            String endDate = (String) message.get("end_date");
            String messageType = (String) message.get("type");
            
            if ("batch_processing".equals(messageType) && userId != null) {
                // Process batch data
                processBatchData(userId, startDate, endDate);
            }
            
        } catch (Exception e) {
            log.error("Error processing batch processing message: {}", e.getMessage());
        }
    }
    
    private void processWorkoutStatistics(Long workoutId, Integer userId) {
        log.info("Processing workout statistics for workout {} and user {}", workoutId, userId);
        
        try {
            // Calculate calories using the existing service
            Map<String, Object> calorieResult = calorieService.calculateCaloriesForWorkout(workoutId, 30); // Default duration
            
            if (calorieResult != null && calorieResult.containsKey("caloriesBurned")) {
                Double calories = (Double) calorieResult.get("caloriesBurned");
                
                // Cache the result
                String cacheKey = String.format("calories:workout:%d:user:%d", workoutId, userId);
                redisTemplate.opsForValue().set(cacheKey, calories, 3600); // 1 hour
                
                log.info("Successfully processed workout {} with {} calories", workoutId, calories);
            }
            
        } catch (Exception e) {
            log.error("Error processing workout statistics: {}", e.getMessage());
        }
    }
    
    private void processProgressAnalysis(Integer userId, String analysisType, String period) {
        log.info("Processing {} progress analysis for user {}", analysisType, userId);
        
        try {
            // Generate analysis based on type
            Map<String, Object> analysis = generateProgressAnalysis(userId, analysisType, period);
            
            // Cache the analysis
            String cacheKey = String.format("progress:%s:user:%d:%s", analysisType, userId, period);
            redisTemplate.opsForValue().set(cacheKey, analysis, 3600); // 1 hour
            
            log.info("Successfully generated {} progress analysis for user {}", analysisType, userId);
            
        } catch (Exception e) {
            log.error("Error processing progress analysis: {}", e.getMessage());
        }
    }
    
    private void processReportGeneration(Integer userId, String reportType) {
        log.info("Generating {} report for user {}", reportType, userId);
        
        try {
            // Generate report based on type
            Map<String, Object> report = generateReport(userId, reportType);
            
            // Cache the report
            String cacheKey = String.format("report:%s:user:%d:current", reportType, userId);
            redisTemplate.opsForValue().set(cacheKey, report, 7200); // 2 hours
            
            log.info("Successfully generated {} report for user {}", reportType, userId);
            
        } catch (Exception e) {
            log.error("Error generating report: {}", e.getMessage());
        }
    }
    
    private void processGoalReminder(Integer userId, Integer goalId, String reminderType) {
        log.info("Processing goal reminder for user {} and goal {} with type {}", userId, goalId, reminderType);
        
        try {
            // Process goal reminder based on type
            if ("goal_completed".equals(reminderType)) {
                log.info("Goal {} completed for user {}", goalId, userId);
                // Could trigger celebration notification, achievement badge, etc.
            } else if ("deadline_approaching".equals(reminderType)) {
                log.info("Goal {} deadline approaching for user {}", goalId, userId);
                // Could trigger reminder notification
            }
            
            // Cache goal status
            String cacheKey = String.format("goal_status:user:%d:goal:%d", userId, goalId);
            redisTemplate.opsForValue().set(cacheKey, reminderType, 1800); // 30 minutes
            
        } catch (Exception e) {
            log.error("Error processing goal reminder: {}", e.getMessage());
        }
    }
    
    private void processBatchData(Integer userId, String startDate, String endDate) {
        log.info("Processing batch data for user {} from {} to {}", userId, startDate, endDate);
        
        try {
            // Process historical data
            Map<String, Object> batchData = processHistoricalData(userId, startDate, endDate);
            
            // Cache the batch data
            String cacheKey = String.format("batch_data:user:%d:%s:%s", userId, startDate, endDate);
            redisTemplate.opsForValue().set(cacheKey, batchData, 3600); // 1 hour
            
            log.info("Successfully processed batch data for user {}", userId);
            
        } catch (Exception e) {
            log.error("Error processing batch data: {}", e.getMessage());
        }
    }
    
    private Map<String, Object> generateProgressAnalysis(Integer userId, String analysisType, String period) {
        // Placeholder implementation - would integrate with actual data analysis
        Map<String, Object> analysis = new HashMap<>();
        analysis.put("user_id", userId);
        analysis.put("analysis_type", analysisType);
        analysis.put("period", period);
        analysis.put("generated_at", System.currentTimeMillis());
        analysis.put("summary", "Analysis generated successfully");
        return analysis;
    }
    
    private Map<String, Object> generateReport(Integer userId, String reportType) {
        // Placeholder implementation - would integrate with actual report generation
        Map<String, Object> report = new HashMap<>();
        report.put("user_id", userId);
        report.put("report_type", reportType);
        report.put("generated_at", System.currentTimeMillis());
        report.put("summary", "Report generated successfully");
        return report;
    }
    
    private Map<String, Object> processHistoricalData(Integer userId, String startDate, String endDate) {
        // Placeholder implementation - would integrate with actual historical data processing
        Map<String, Object> batchData = new HashMap<>();
        batchData.put("user_id", userId);
        batchData.put("start_date", startDate);
        batchData.put("end_date", endDate);
        batchData.put("processed_at", System.currentTimeMillis());
        batchData.put("summary", "Historical data processed successfully");
        return batchData;
    }
}
