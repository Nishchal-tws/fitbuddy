package com.fitbuddy.analytics.repository;

import com.fitbuddy.analytics.entity.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    
    @Query("SELECT e FROM Exercise e WHERE e.difficultyLevel = :level ORDER BY e.name")
    List<Exercise> findByDifficultyLevel(String level);
    
    @Query("SELECT e FROM Exercise e WHERE e.muscleGroup = :muscleGroup ORDER BY e.name")
    List<Exercise> findByMuscleGroup(String muscleGroup);
    
    @Query("SELECT e FROM Exercise e WHERE e.equipmentNeeded = 'Bodyweight' ORDER BY e.name")
    List<Exercise> findBodyweightExercises();
}
