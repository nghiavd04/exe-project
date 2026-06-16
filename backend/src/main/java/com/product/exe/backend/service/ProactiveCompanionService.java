package com.product.exe.backend.service;

public interface ProactiveCompanionService {
    /**
     * Evaluates the customer's progress for the current day and past 7 days,
     * and sends a proactive AI notification if they have pending tasks.
     *
     * @param customerId The ID of the customer
     * @param currentDay The current day number in their program
     */
    void evaluateAndRemindCustomer(Long customerId, Integer currentDay);
}
