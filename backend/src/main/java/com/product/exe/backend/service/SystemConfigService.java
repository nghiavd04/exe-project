package com.product.exe.backend.service;

public interface SystemConfigService {
    String getOrSetDefaultValue(String key, String defaultValue);
    void updateValue(String key, String value);
}
