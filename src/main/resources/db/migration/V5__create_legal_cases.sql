CREATE TABLE legal_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cnj_number VARCHAR(20) NOT NULL,
    title VARCHAR(180) NOT NULL,
    subject VARCHAR(150),
    court VARCHAR(150),
    tribunal VARCHAR(150),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    opening_date DATE NOT NULL,
    closing_date DATE,
    client_id UUID NOT NULL,
    assigned_lawyer_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uk_legal_cases_cnj UNIQUE (cnj_number),
    CONSTRAINT fk_legal_cases_client FOREIGN KEY (client_id) REFERENCES clients(id),
    CONSTRAINT fk_legal_cases_lawyer FOREIGN KEY (assigned_lawyer_id) REFERENCES users(id),
    CONSTRAINT ck_legal_cases_status CHECK (status IN ('ACTIVE','SUSPENDED','CLOSED')),
    CONSTRAINT ck_legal_cases_priority CHECK (priority IN ('LOW','NORMAL','HIGH','URGENT')),
    CONSTRAINT ck_legal_cases_dates CHECK (closing_date IS NULL OR closing_date >= opening_date)
);
CREATE INDEX idx_legal_cases_client ON legal_cases(client_id);
CREATE INDEX idx_legal_cases_lawyer ON legal_cases(assigned_lawyer_id);
CREATE INDEX idx_legal_cases_status ON legal_cases(status);
CREATE INDEX idx_legal_cases_cnj ON legal_cases(cnj_number);
