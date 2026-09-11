package com.lawfirm.management.security;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lawfirm.management.common.exception.ApiErrorResponse;
import jakarta.servlet.http.*;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.List;
@Component
public class JsonAccessDeniedHandler implements AccessDeniedHandler {
    private final ObjectMapper mapper;
    public JsonAccessDeniedHandler(ObjectMapper mapper) { this.mapper = mapper; }
    @Override public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException ex) throws java.io.IOException {
        response.setStatus(403); response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        mapper.writeValue(response.getOutputStream(), new ApiErrorResponse(LocalDateTime.now(),403,"Forbidden","Você não possui permissão para esta operação.",request.getRequestURI(),List.of()));
    }
}
