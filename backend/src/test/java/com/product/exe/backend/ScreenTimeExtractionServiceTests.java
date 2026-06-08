package com.product.exe.backend;

import com.product.exe.backend.service.impl.ScreenTimeExtractionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ScreenTimeExtractionServiceTests {

    private ScreenTimeExtractionServiceImpl service;

    @BeforeEach
    void setUp() {
        // We only test the parsing logic, no repositories needed
        service = new ScreenTimeExtractionServiceImpl(null, null);
    }

    @Test
    void testParseScreenTime_CombinedHoursAndMinutes() {
        assertEquals(272, service.parseScreenTime("4h 32m"));
        assertEquals(272, service.parseScreenTime("4h32m"));
        assertEquals(272, service.parseScreenTime("4 hr 32 min"));
        assertEquals(272, service.parseScreenTime("4 hrs 32 mins"));
        assertEquals(272, service.parseScreenTime("4 giờ 32 phút"));
        assertEquals(272, service.parseScreenTime("4g 32p"));
        assertEquals(150, service.parseScreenTime("2h 30m"));
    }

    @Test
    void testParseScreenTime_DigitalColonFormat() {
        assertEquals(272, service.parseScreenTime("4:32"));
        assertEquals(272, service.parseScreenTime("04:32"));
        assertEquals(602, service.parseScreenTime("10:02"));
    }

    @Test
    void testParseScreenTime_HoursOnly() {
        assertEquals(240, service.parseScreenTime("4h"));
        assertEquals(240, service.parseScreenTime("4 hr"));
        assertEquals(240, service.parseScreenTime("4 hours"));
        assertEquals(240, service.parseScreenTime("4 giờ"));
        assertEquals(240, service.parseScreenTime("4g"));
    }

    @Test
    void testParseScreenTime_MinutesOnly() {
        assertEquals(32, service.parseScreenTime("32m"));
        assertEquals(32, service.parseScreenTime("32 min"));
        assertEquals(32, service.parseScreenTime("32 mins"));
        assertEquals(32, service.parseScreenTime("32 phút"));
        assertEquals(32, service.parseScreenTime("32p"));
    }

    @Test
    void testParseScreenTime_MixedText() {
        String ocrResult1 = "Screen Time\nDaily Average\n4h 32m\nDevice: iPhone";
        assertEquals(272, service.parseScreenTime(ocrResult1));

        String ocrResult2 = "Thời gian sử dụng trung bình hàng ngày là 4 giờ 32 phút.";
        assertEquals(272, service.parseScreenTime(ocrResult2));

        String ocrResult3 = "Total time: 4:32 left today";
        assertEquals(272, service.parseScreenTime(ocrResult3));
    }

    @Test
    void testParseScreenTime_InvalidOrEmpty() {
        assertNull(service.parseScreenTime(""));
        assertNull(service.parseScreenTime(null));
        assertNull(service.parseScreenTime("some random text without time"));
        assertNull(service.parseScreenTime("abc 123 xyz"));
    }
}
