package com.fitbuddy.analytics.service;

import com.fitbuddy.analytics.entity.User;
import com.fitbuddy.analytics.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DatabaseVerificationService implements CommandLineRunner {
    
    private final UserRepository userRepository;
    
    @Override
    public void run(String... args) throws Exception {
        log.info("=== Starting Database Verification ===");
        
        // Add a small delay to ensure database is ready
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        try {
            List<User> users = userRepository.findAll();
            
            log.info("Successfully connected to FitBuddy database!");
            log.info("Total users found: {}", users.size());
            
            if (!users.isEmpty()) {
                log.info("User emails:");
                users.forEach(user -> 
                    log.info("- ID: {}, Email: {}, Name: {}, Experience: {}", 
                        user.getId(), 
                        user.getEmail(), 
                        user.getFullName(),
                        user.getExperienceLevel())
                );
            } else {
                log.info("No users found in the database.");
            }
            
            log.info("=== Database Verification Complete ===");
            
        } catch (Exception e) {
            log.error("Failed to connect to database: {}", e.getMessage());
            log.error("This might be a temporary connection issue. The application will continue to run.");
            // Don't throw the exception to prevent application shutdown
        }
    }
}

