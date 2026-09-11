CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(180) NOT NULL,
    description VARCHAR(1000),
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP NOT NULL,
    location VARCHAR(255),
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    assigned_user_id UUID NOT NULL,
    legal_case_id UUID,
    client_id UUID,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    version BIGINT,
    CONSTRAINT fk_appointments_user FOREIGN KEY (assigned_user_id) REFERENCES users(id),
    CONSTRAINT fk_appointments_case FOREIGN KEY (legal_case_id) REFERENCES legal_cases(id),
    CONSTRAINT fk_appointments_client FOREIGN KEY (client_id) REFERENCES clients(id),
    CONSTRAINT ck_appointments_type CHECK (type IN ('HEARING','MEETING','CONSULTATION','OTHER')),
    CONSTRAINT ck_appointments_status CHECK (status IN ('SCHEDULED','COMPLETED','CANCELLED')),
    CONSTRAINT ck_appointments_dates CHECK (ends_at > starts_at)
);
CREATE INDEX idx_appointments_start ON appointments(starts_at);
CREATE INDEX idx_appointments_user ON appointments(assigned_user_id);
CREATE INDEX idx_appointments_case ON appointments(legal_case_id);
CREATE INDEX idx_appointments_status ON appointments(status);
