package com.fitbuddy.analytics.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Queue Names
    public static final String WORKOUT_PROCESSING_QUEUE = "workout.processing.queue";
    public static final String PROGRESS_ANALYSIS_QUEUE = "progress.analysis.queue";
    public static final String REPORT_GENERATION_QUEUE = "report.generation.queue";
    public static final String GOAL_REMINDER_QUEUE = "goal.reminder.queue";
    public static final String BATCH_PROCESSING_QUEUE = "batch.processing.queue";
    public static final String NOTIFICATION_QUEUE = "notification.queue";

    // Exchange Names
    public static final String FITNESS_EXCHANGE = "fitness.exchange";

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(ConnectionFactory connectionFactory) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(jsonMessageConverter());
        return factory;
    }

    // Exchange
    @Bean
    public TopicExchange fitnessExchange() {
        return new TopicExchange(FITNESS_EXCHANGE);
    }

    // Queues
    @Bean
    public Queue workoutProcessingQueue() {
        return QueueBuilder.durable(WORKOUT_PROCESSING_QUEUE).build();
    }

    @Bean
    public Queue progressAnalysisQueue() {
        return QueueBuilder.durable(PROGRESS_ANALYSIS_QUEUE).build();
    }

    @Bean
    public Queue reportGenerationQueue() {
        return QueueBuilder.durable(REPORT_GENERATION_QUEUE).build();
    }

    @Bean
    public Queue goalReminderQueue() {
        return QueueBuilder.durable(GOAL_REMINDER_QUEUE).build();
    }

    @Bean
    public Queue batchProcessingQueue() {
        return QueueBuilder.durable(BATCH_PROCESSING_QUEUE).build();
    }

    @Bean
    public Queue notificationQueue() {
        return QueueBuilder.durable(NOTIFICATION_QUEUE).build();
    }

    // Bindings
    @Bean
    public Binding workoutProcessingBinding() {
        return BindingBuilder
                .bind(workoutProcessingQueue())
                .to(fitnessExchange())
                .with("workout.processing.*");
    }

    @Bean
    public Binding progressAnalysisBinding() {
        return BindingBuilder
                .bind(progressAnalysisQueue())
                .to(fitnessExchange())
                .with("progress.analysis.*");
    }

    @Bean
    public Binding reportGenerationBinding() {
        return BindingBuilder
                .bind(reportGenerationQueue())
                .to(fitnessExchange())
                .with("report.generation.*");
    }

    @Bean
    public Binding goalReminderBinding() {
        return BindingBuilder
                .bind(goalReminderQueue())
                .to(fitnessExchange())
                .with("goal.reminder.*");
    }

    @Bean
    public Binding batchProcessingBinding() {
        return BindingBuilder
                .bind(batchProcessingQueue())
                .to(fitnessExchange())
                .with("batch.processing.*");
    }

    @Bean
    public Binding notificationBinding() {
        return BindingBuilder
                .bind(notificationQueue())
                .to(fitnessExchange())
                .with("notification.*");
    }
}
