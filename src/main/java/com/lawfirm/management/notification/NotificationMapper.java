package com.lawfirm.management.notification;
import com.lawfirm.management.notification.dto.NotificationResponse; import org.mapstruct.Mapper;
@Mapper(componentModel="spring") public interface NotificationMapper { NotificationResponse toResponse(Notification entity); }
