package com.lawfirm.management.config;

import org.junit.jupiter.api.Test;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;

import static org.junit.jupiter.api.Assertions.*;

class WebConfigTest {
    @Test
    void shouldLimitPageSizeTo100() {
        var resolver = new PageableHandlerMethodArgumentResolver();
        new WebConfig().customize(resolver);
        assertEquals(100, resolver.getMaxPageSize());
    }
}
