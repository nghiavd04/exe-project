package com.product.exe.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Native WebSocket support
        registry.addEndpoint("/api/ws-chat")
                .setAllowedOriginPatterns("*");
        // SockJS fallback support
        registry.addEndpoint("/api/ws-chat")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // "/topic" is for broadcasting (pub/sub), Client listens to this topic prefix
        registry.enableSimpleBroker("/topic");
        // "/app" is for client-to-server messaging destinations
        registry.setApplicationDestinationPrefixes("/app");
    }
}
