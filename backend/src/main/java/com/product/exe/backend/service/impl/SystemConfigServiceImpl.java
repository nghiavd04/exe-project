package com.product.exe.backend.service.impl;

import com.product.exe.backend.entity.SystemConfig;
import com.product.exe.backend.repository.SystemConfigRepository;
import com.product.exe.backend.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SystemConfigServiceImpl implements SystemConfigService {
    private final SystemConfigRepository systemConfigRepository;

    @Override
    @Transactional
    public String getOrSetDefaultValue(String key, String defaultValue) {
        return systemConfigRepository.findById(key)
                .map(SystemConfig::getConfigValue)
                .orElseGet(() -> {
                    SystemConfig config = SystemConfig.builder()
                            .configKey(key)
                            .configValue(defaultValue)
                            .build();
                    systemConfigRepository.save(config);
                    return defaultValue;
                });
    }

    @Override
    @Transactional
    public void updateValue(String key, String value) {
        SystemConfig config = systemConfigRepository.findById(key)
                .orElseGet(() -> SystemConfig.builder().configKey(key).build());
        config.setConfigValue(value);
        systemConfigRepository.save(config);
    }
}
