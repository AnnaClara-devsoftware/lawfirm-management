package com.lawfirm.management.notification.dto;
import com.lawfirm.management.notification.NotificationType; import java.time.LocalDateTime; import java.util.UUID;
public record NotificationResponse(UUID id,NotificationType type,String title,String message,String referenceType,UUID referenceId,boolean read,LocalDateTime createdAt) {}
