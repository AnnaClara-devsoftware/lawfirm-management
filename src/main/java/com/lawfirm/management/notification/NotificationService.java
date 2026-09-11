package com.lawfirm.management.notification;
import com.lawfirm.management.common.exception.ResourceNotFoundException; import com.lawfirm.management.deadline.*; import com.lawfirm.management.appointment.*; import com.lawfirm.management.notification.dto.*; import com.lawfirm.management.user.User; import lombok.RequiredArgsConstructor; import org.springframework.data.domain.*; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional; import java.time.*; import java.util.UUID;
@Service @RequiredArgsConstructor public class NotificationService {
 private final NotificationRepository repository; private final NotificationMapper mapper;
 @Transactional(readOnly=true) public Page<NotificationResponse> list(boolean unread,Pageable pageable,User user){Page<Notification> p=unread?repository.findAllByUserIdAndReadFalseOrderByCreatedAtDesc(user.getId(),pageable):repository.findAllByUserIdOrderByCreatedAtDesc(user.getId(),pageable);return p.map(mapper::toResponse);}
 @Transactional(readOnly=true) public long unreadCount(User user){return repository.countByUserIdAndReadFalse(user.getId());}
 @Transactional public NotificationResponse markRead(UUID id,User user){Notification n=repository.findById(id).orElseThrow(()->ResourceNotFoundException.of("Notificação",id));ensureOwner(n,user);n.setRead(true);return mapper.toResponse(n);}
 @Transactional public void markAllRead(User user){repository.findAllByUserIdAndReadFalseOrderByCreatedAtDesc(user.getId(),Pageable.unpaged()).forEach(n->n.setRead(true));}
 @Transactional public void createDeadlineReminder(Deadline d,User u){createIfAbsent(u,NotificationType.DEADLINE_REMINDER,"Prazo próximo", "O prazo '"+d.getTitle()+"' vence em "+d.getDueDate()+".","DEADLINE",d.getId());}
 @Transactional public void createAppointmentReminder(Appointment a,User u){createIfAbsent(u,NotificationType.APPOINTMENT_REMINDER,"Compromisso próximo", "O compromisso '"+a.getTitle()+"' começa em "+a.getStartsAt()+".","APPOINTMENT",a.getId());}
 private void createIfAbsent(User u,NotificationType t,String title,String msg,String rt,UUID rid){if(repository.existsByUserIdAndTypeAndReferenceTypeAndReferenceId(u.getId(),t,rt,rid))return;repository.save(Notification.builder().user(u).type(t).title(title).message(msg).referenceType(rt).referenceId(rid).read(false).build());}
 private void ensureOwner(Notification n,User u){if(!n.getUser().getId().equals(u.getId()))throw new com.lawfirm.management.common.exception.ForbiddenOperationException("Você não possui acesso a esta notificação.");}
}
