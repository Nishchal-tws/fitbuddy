package com.fitbuddy.analytics.repository;

import com.fitbuddy.analytics.entity.Workout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutRepository extends JpaRepository<Workout, Long> {
    
    @Query("SELECT w FROM Workout w WHERE w.ownerId IS NULL ORDER BY w.createdAt DESC")
    List<Workout> findSystemPlans();
    
    @Query("SELECT w FROM Workout w WHERE w.ownerId IS NULL AND w.level = :level ORDER BY w.createdAt DESC")
    List<Workout> findSystemPlansByLevel(String level);
    
    @Query("SELECT w FROM Workout w WHERE w.ownerId = :ownerId ORDER BY w.createdAt DESC")
    List<Workout> findUserPlans(Long ownerId);
    
    @Query("SELECT w FROM Workout w WHERE w.goalId = :goalId ORDER BY w.createdAt DESC")
    List<Workout> findPlansByGoalId(Long goalId);
}
