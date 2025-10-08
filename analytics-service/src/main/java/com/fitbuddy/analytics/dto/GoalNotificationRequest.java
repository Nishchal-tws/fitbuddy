package com.fitbuddy.analytics.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoalNotificationRequest {
    private Long goalId;
    private Long userId;
}
