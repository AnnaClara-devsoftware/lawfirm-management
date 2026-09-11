CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    document VARCHAR(14) UNIQUE,
    email VARCHAR(180),
    phone VARCHAR(30),
    street VARCHAR(120),
    number VARCHAR(20),
    complement VARCHAR(100),
    neighborhood VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(9),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    assigned_lawyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    version BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_assigned_lawyer ON clients(assigned_lawyer_id);
CREATE INDEX idx_clients_active ON clients(active);
