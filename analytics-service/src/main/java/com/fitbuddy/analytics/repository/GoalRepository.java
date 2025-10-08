package com.fitbuddy.analytics.repository;

import com.fitbuddy.analytics.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    
    @Query("SELECT g FROM Goal g WHERE g.ownerId = :ownerId ORDER BY g.id DESC")
    List<Goal> findByOwnerIdOrderByIdDesc(Long ownerId);
    
    @Query("SELECT g FROM Goal g WHERE g.ownerId = :ownerId AND g.isCompleted = false ORDER BY g.id DESC")
    List<Goal> findActiveGoalsByOwnerId(Long ownerId);
}
