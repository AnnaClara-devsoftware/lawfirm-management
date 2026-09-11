package com.lawfirm.management.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.web.config.PageableHandlerMethodArgumentResolverCustomizer;

@Configuration
public class WebConfig implements PageableHandlerMethodArgumentResolverCustomizer {
    @Override
    public void customize(org.springframework.data.web.PageableHandlerMethodArgumentResolver resolver) {
        resolver.setMaxPageSize(100);
        resolver.setOneIndexedParameters(false);
    }
}
