CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(30) NOT NULL,
    title VARCHAR(180) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    reference_type VARCHAR(40),
    reference_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT ck_notifications_type CHECK (type IN ('DEADLINE_REMINDER','APPOINTMENT_REMINDER','SYSTEM'))
);
CREATE INDEX idx_notifications_user_read ON notifications(user_id,is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
CREATE UNIQUE INDEX uq_notifications_reference ON notifications(user_id,type,reference_type,reference_id);
