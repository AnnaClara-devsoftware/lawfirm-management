package com.lawfirm.management.dashboard;
import com.lawfirm.management.client.ClientRepository; import com.lawfirm.management.appointment.*; import com.lawfirm.management.dashboard.dto.DashboardResponse; import com.lawfirm.management.deadline.*; import com.lawfirm.management.legalcase.*; import com.lawfirm.management.notification.NotificationRepository; import com.lawfirm.management.user.*; import lombok.RequiredArgsConstructor; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional; import java.time.*;
@Service @RequiredArgsConstructor public class DashboardService {
 private final UserRepository users; private final ClientRepository clients; private final LegalCaseRepository cases; private final DeadlineRepository deadlines; private final com.lawfirm.management.appointment.AppointmentRepository appointments; private final NotificationRepository notifications;
 @Transactional(readOnly=true) public DashboardResponse summary(User user){
  boolean admin=user.getRole()==Role.ADMIN || user.getRole()==Role.ASSISTENTE;
  long totalUsers=admin?users.count():1, activeUsers=admin?users.countByActiveTrue():(user.isActive()?1:0);
  long totalClients=admin?clients.count():clients.countByAssignedLawyerId(user.getId()), activeClients=admin?clients.countByActiveTrue():clients.countByAssignedLawyerIdAndActiveTrue(user.getId());
  long totalCases=admin?cases.count():cases.countByAssignedLawyerId(user.getId()), activeCases=admin?cases.countByStatus(LegalCaseStatus.ACTIVE):cases.countByAssignedLawyerIdAndStatus(user.getId(),LegalCaseStatus.ACTIVE);
  long pending=admin?deadlines.countByStatus(DeadlineStatus.PENDING):deadlines.countByLegalCaseAssignedLawyerIdAndStatus(user.getId(),DeadlineStatus.PENDING);
  long overdue=admin?deadlines.countByDueDateBeforeAndStatus(LocalDate.now(),DeadlineStatus.PENDING):deadlines.countByLegalCaseAssignedLawyerIdAndDueDateBeforeAndStatus(user.getId(),LocalDate.now(),DeadlineStatus.PENDING);
  long upcoming=admin?appointments.countByStartsAtBetweenAndStatus(LocalDateTime.now(),LocalDateTime.now().plusHours(24),AppointmentStatus.SCHEDULED):appointments.countByAssignedUserIdAndStartsAtBetweenAndStatus(user.getId(),LocalDateTime.now(),LocalDateTime.now().plusHours(24),AppointmentStatus.SCHEDULED);
  long unread=notifications.countByUserIdAndReadFalse(user.getId()); return new DashboardResponse(totalUsers,activeUsers,totalClients,activeClients,totalCases,activeCases,pending,overdue,upcoming,unread);
 }
}
