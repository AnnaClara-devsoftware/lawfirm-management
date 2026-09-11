package com.lawfirm.management.notification;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.lawfirm.management.notification.dto.*; import com.lawfirm.management.user.User; import lombok.RequiredArgsConstructor; import org.springframework.data.domain.*; import org.springframework.security.core.annotation.AuthenticationPrincipal; import org.springframework.web.bind.annotation.*; import java.util.UUID;
@SecurityRequirement(name="bearerAuth")
@Tag(name="Notificações", description="Consulta e gerenciamento de notificações.")
@RestController @RequestMapping("/api/notifications") @RequiredArgsConstructor public class NotificationController {private final NotificationService service;
 @Operation(summary="Listar notificações")
    @GetMapping public Page<NotificationResponse> list(@RequestParam(defaultValue="false") boolean unread,Pageable pageable,@AuthenticationPrincipal User user){return service.list(unread,pageable,user);}
 @Operation(summary="Contar notificações não lidas")
    @GetMapping("/unread/count") public long unreadCount(@AuthenticationPrincipal User user){return service.unreadCount(user);}
 @Operation(summary="Marcar notificação como lida")
    @PatchMapping("/{id}/read") public NotificationResponse read(@PathVariable UUID id,@AuthenticationPrincipal User user){return service.markRead(id,user);}
 @Operation(summary="Marcar todas como lidas")
    @PatchMapping("/read-all") public void readAll(@AuthenticationPrincipal User user){service.markAllRead(user);}
}
