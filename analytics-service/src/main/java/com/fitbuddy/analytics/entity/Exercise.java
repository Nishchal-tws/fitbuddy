package com.fitbuddy.analytics.entity;

import javax.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "exercises")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Exercise {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false, length = 255)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "muscle_group", length = 100)
    private String muscleGroup;
    
    @Column(name = "equipment_needed", length = 255)
    private String equipmentNeeded;
    
    @Column(name = "difficulty_level", length = 50)
    private String difficultyLevel;
    
    @Column(name = "instructions", columnDefinition = "TEXT")
    private String instructions;
}
