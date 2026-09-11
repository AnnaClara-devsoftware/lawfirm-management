package com.lawfirm.management.document;

import com.lawfirm.management.client.Client;
import com.lawfirm.management.common.BaseEntity;
import com.lawfirm.management.legalcase.LegalCase;
import com.lawfirm.management.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(callSuper=false, of="id")
@Entity @Table(name="documents", indexes={
 @Index(name="idx_documents_case", columnList="legal_case_id"),
 @Index(name="idx_documents_client", columnList="client_id"),
 @Index(name="idx_documents_uploaded_by", columnList="uploaded_by"),
 @Index(name="idx_documents_sha256", columnList="sha256")})
public class Document extends BaseEntity {
 @Id @GeneratedValue @UuidGenerator private UUID id;
 @Column(name="original_filename", nullable=false, length=255) private String originalFilename;
 @Column(name="storage_key", nullable=false, unique=true, length=255) private String storageKey;
 @Column(name="content_type", nullable=false, length=120) private String contentType;
 @Column(name="file_size", nullable=false) private long fileSize;
 @Column(nullable=false, length=64) private String sha256;
 @Column(length=500) private String description;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="legal_case_id") private LegalCase legalCase;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="client_id") private Client client;
 @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="uploaded_by", nullable=false) private User uploadedBy;
 @Version private Long version;
}
