package com.product.exe.backend.exception;

public class GeminiRateLimitException extends RuntimeException {
    public GeminiRateLimitException(String message) {
        super(message);
    }
}
