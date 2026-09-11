package com.lawfirm.management.common.audit;

import lombok.RequiredArgsConstructor;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {
    private final AuditLogService auditLogService;

    @AfterReturning(pointcut = "@annotation(auditable)", returning = "result")
    public void audit(Auditable auditable, Object result) {
        try {
            auditLogService.record(auditable.action(), auditable.entityName(), extractId(result), auditable.description());
        } catch (Exception ignored) {
            // Auditoria nunca deve impedir a operação principal.
        }
    }

    private String extractId(Object value) {
        if (value == null) return null;
        Object candidate = invoke(value, "getId");
        if (candidate != null) return candidate.toString();
        Object nestedUser = invoke(value, "getUser");
        if (nestedUser != null) {
            Object id = invoke(nestedUser, "getId");
            if (id != null) return id.toString();
        }
        return null;
    }

    private Object invoke(Object target, String methodName) {
        try {
            Method method = target.getClass().getMethod(methodName);
            return method.invoke(target);
        } catch (Exception ignored) {
            return null;
        }
    }
}
