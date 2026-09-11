package com.lawfirm.management.appointment;
import org.springframework.data.domain.*; import org.springframework.data.jpa.repository.JpaRepository; import java.time.LocalDateTime; import java.util.UUID;
public interface AppointmentRepository extends JpaRepository<Appointment,UUID> {
 Page<Appointment> findAllByAssignedUserId(UUID userId, Pageable pageable);
 Page<Appointment> findAllByStatus(AppointmentStatus status, Pageable pageable);
 Page<Appointment> findAllByAssignedUserIdAndStatus(UUID userId, AppointmentStatus status, Pageable pageable);
 Page<Appointment> findAllByStartsAtBetween(LocalDateTime from, LocalDateTime to, Pageable pageable);
 boolean existsByAssignedUserIdAndStartsAtAndStatusNot(UUID userId, LocalDateTime startsAt, AppointmentStatus status);
 long countByStartsAtBetweenAndStatus(LocalDateTime from, LocalDateTime to, AppointmentStatus status);
 long countByAssignedUserIdAndStartsAtBetweenAndStatus(UUID userId, LocalDateTime from, LocalDateTime to, AppointmentStatus status);
 boolean existsByAssignedUserIdAndStartsAtAndStatusNotAndIdNot(UUID userId, LocalDateTime startsAt, AppointmentStatus status, UUID id);
}
