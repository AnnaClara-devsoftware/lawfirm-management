CREATE TABLE documents (
 id UUID PRIMARY KEY,
 original_filename VARCHAR(255) NOT NULL,
 storage_key VARCHAR(255) NOT NULL UNIQUE,
 content_type VARCHAR(120) NOT NULL,
 file_size BIGINT NOT NULL CHECK (file_size > 0),
 sha256 VARCHAR(64) NOT NULL,
 description VARCHAR(500),
 legal_case_id UUID REFERENCES legal_cases(id),
 client_id UUID REFERENCES clients(id),
 uploaded_by UUID NOT NULL REFERENCES users(id),
 created_at TIMESTAMP NOT NULL,
 updated_at TIMESTAMP NOT NULL,
 version BIGINT,
 CONSTRAINT chk_documents_owner_context CHECK (legal_case_id IS NOT NULL OR client_id IS NOT NULL)
);
CREATE INDEX idx_documents_case ON documents(legal_case_id);
CREATE INDEX idx_documents_client ON documents(client_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_sha256 ON documents(sha256);
