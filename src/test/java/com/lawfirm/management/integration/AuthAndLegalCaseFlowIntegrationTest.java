package com.lawfirm.management.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Teste de integração ponta a ponta rodando contra um PostgreSQL REAL via
 * Testcontainers — não H2. E' isso que efetivamente valida as migrations
 * Flyway (sintaxe Postgres: CHECK constraints, gen_random_uuid(), pgcrypto),
 * o que a suite baseada em application-test.yml (H2 + Flyway desabilitado)
 * nunca exercita.
 *
 * Cobre tambem a regra de negocio corrigida nesta revisao: um usuario
 * ASSISTENTE nao pode criar processo juridico (403), enquanto um ADVOGADO
 * pode (201).
 *
 * Requer Docker disponivel na maquina/CI que executa os testes — em GitHub
 * Actions (ubuntu-latest) isso ja vem disponivel por padrao.
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
class AuthAndLegalCaseFlowIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("lawfirm_it")
            .withUsername("lawfirm_it")
            .withPassword("lawfirm_it");

    @DynamicPropertySource
    static void datasourceProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        // spring.flyway.* e jpa.hibernate.ddl-auto=validate ficam com os
        // valores padrao do application.yml — e isso que queremos exercitar.
    }

    private static final SecureRandom RANDOM = new SecureRandom();

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void assistenteNaoPodeCriarProcessoMasAdvogadoPode() throws Exception {
        String lawyerToken = registerAndGetToken("Advogada Teste", uniqueEmail("advogada"), "ADVOGADO");
        String assistantToken = registerAndGetToken("Assistente Teste", uniqueEmail("assistente"), "ASSISTENTE");

        UUID clientId = createClient(lawyerToken);

        // ADVOGADO cria normalmente.
        mockMvc.perform(post("/api/legal-cases")
                        .header("Authorization", "Bearer " + lawyerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(legalCasePayload(clientId, randomCnj())))
                .andExpect(status().isCreated());

        // ASSISTENTE e barrado — regra que estava faltando antes desta correcao.
        mockMvc.perform(post("/api/legal-cases")
                        .header("Authorization", "Bearer " + assistantToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(legalCasePayload(clientId, randomCnj())))
                .andExpect(status().isForbidden());
    }

    private String registerAndGetToken(String name, String email, String role) throws Exception {
        String payload = String.format(
                "{\"name\":\"%s\",\"email\":\"%s\",\"password\":\"senha-forte-123\",\"phone\":\"83999990000\",\"role\":\"%s\"}",
                name, email, role);

        String response = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(response).get("accessToken").asText();
    }

    private UUID createClient(String lawyerToken) throws Exception {
        String payload = "{\"name\":\"Cliente de Teste\",\"document\":\"12345678901\"}";

        String response = mockMvc.perform(post("/api/clients")
                        .header("Authorization", "Bearer " + lawyerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        return UUID.fromString(objectMapper.readTree(response).get("id").asText());
    }

    private String legalCasePayload(UUID clientId, String cnjNumber) {
        return String.format(
                "{\"cnjNumber\":\"%s\",\"title\":\"Acao de cobranca\",\"subject\":\"Civel\"," +
                "\"court\":\"1a Vara Civel\",\"tribunal\":\"TJPB\",\"priority\":\"NORMAL\"," +
                "\"openingDate\":\"%s\",\"clientId\":\"%s\"}",
                cnjNumber, LocalDate.now(), clientId);
    }

    private static String uniqueEmail(String prefix) {
        return prefix + "-" + UUID.randomUUID() + "@lawfirm.test";
    }

    /** Gera uma sequencia numerica de exatamente 20 digitos (formato exigido pela entidade). */
    private static String randomCnj() {
        StringBuilder sb = new StringBuilder(20);
        for (int i = 0; i < 20; i++) {
            sb.append(RANDOM.nextInt(10));
        }
        return sb.toString();
    }
}
