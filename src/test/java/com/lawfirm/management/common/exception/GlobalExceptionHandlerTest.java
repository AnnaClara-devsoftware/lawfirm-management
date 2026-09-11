package com.lawfirm.management.common.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {
    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void shouldReturn401ForUnauthorizedException() {
        var request = request("/api/auth/refresh");
        var response = handler.handleUnauthorized(new UnauthorizedException("Token inválido."), request);
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(401, response.getBody().status());
        assertEquals("/api/auth/refresh", response.getBody().path());
    }

    @Test
    void shouldReturn413WhenUploadLimitIsExceeded() {
        var request = request("/api/documents");
        var response = handler.handleUploadSize(new MaxUploadSizeExceededException(10_000_000L), request);
        assertEquals(HttpStatus.PAYLOAD_TOO_LARGE, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(413, response.getBody().status());
    }

    private MockHttpServletRequest request(String path) {
        var request = new MockHttpServletRequest();
        request.setRequestURI(path);
        return request;
    }
}
