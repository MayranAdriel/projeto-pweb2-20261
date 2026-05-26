package br.edu.ifpb.financas.api;

import br.edu.ifpb.financas.api.transaction.TransactionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
class TransactionControllerTest {

    @Autowired WebApplicationContext wac;
    @Autowired TransactionRepository transactionRepository;
    MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String adminToken;
    private Long createdTransactionId;

    @BeforeEach
    void setUp() throws Exception {
        mockMvc = MockMvcBuilders.webAppContextSetup(wac)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
        transactionRepository.deleteAll();
        adminToken = getToken("admin", "password123");

        // Cria 2 receitas e 2 despesas para os testes de filtro
        createTransaction(adminToken, "INCOME", 1000.00, 1L, "2026-05-10");
        createTransaction(adminToken, "INCOME", 500.00, 2L, "2026-05-15");
        createTransaction(adminToken, "EXPENSE", 200.00, 1L, "2026-04-20");
        MvcResult result = createTransaction(adminToken, "EXPENSE", 300.00, 3L, "2026-05-20");

        createdTransactionId = objectMapper.readTree(result.getResponse().getContentAsString())
                .get("id").asLong();
    }

    @Test
    void listTransactions_semToken_retorna401() throws Exception {
        mockMvc.perform(get("/transactions"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void listTransactions_comToken_retornaPaginaComTransacoes() throws Exception {
        mockMvc.perform(get("/transactions")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").value(4));
    }

    @Test
    void listTransactions_filtrandoPorTipoIncome_retornaApenasReceitas() throws Exception {
        mockMvc.perform(get("/transactions?type=INCOME")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.content[0].type").value("INCOME"));
    }

    @Test
    void listTransactions_filtrandoPorTipoExpense_retornaApenasDespesas() throws Exception {
        mockMvc.perform(get("/transactions?type=EXPENSE")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.content[0].type").value("EXPENSE"));
    }

    @Test
    void listTransactions_filtrandoPorCategoria_retornaTransacoesDaCategoria() throws Exception {
        mockMvc.perform(get("/transactions?categoryId=1")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    void listTransactions_filtrandoPorPeriodo_retornaTransacoesNoPeriodo() throws Exception {
        mockMvc.perform(get("/transactions?startDate=2026-05-01&endDate=2026-05-31")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(3));
    }

    @Test
    void createTransaction_comBodyInvalido_retorna400ComCamposDeErro() throws Exception {
        mockMvc.perform(post("/transactions")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "amount", -100,
                                "type", "INCOME"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.amount").isNotEmpty());
    }

    @Test
    void createTransaction_comDadosValidos_retorna201() throws Exception {
        mockMvc.perform(post("/transactions")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "amount", 750.00,
                                "type", "INCOME",
                                "categoryId", 1,
                                "date", "2026-05-25"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.amount").value(750.00))
                .andExpect(jsonPath("$.type").value("INCOME"));
    }

    @Test
    void getTransaction_comIdValido_retornaTransacao() throws Exception {
        mockMvc.perform(get("/transactions/" + createdTransactionId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(createdTransactionId));
    }

    @Test
    void getTransaction_deOutroUsuario_retorna403() throws Exception {
        String otherToken = registerAndGetToken("outro_user_" + System.currentTimeMillis());

        mockMvc.perform(get("/transactions/" + createdTransactionId)
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    void updateTransaction_comDadosValidos_retorna200ComDadosAtualizados() throws Exception {
        mockMvc.perform(put("/transactions/" + createdTransactionId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "amount", 999.99,
                                "type", "INCOME",
                                "categoryId", 2,
                                "date", "2026-05-25",
                                "description", "Atualizado"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(999.99))
                .andExpect(jsonPath("$.type").value("INCOME"))
                .andExpect(jsonPath("$.description").value("Atualizado"));
    }

    @Test
    void deleteTransaction_deOutroUsuario_retorna403() throws Exception {
        String otherToken = registerAndGetToken("del_user_" + System.currentTimeMillis());

        mockMvc.perform(delete("/transactions/" + createdTransactionId)
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isForbidden());
    }

    // --- helpers ---

    private String getToken(String username, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("username", username, "password", password))))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }

    private String registerAndGetToken(String username) throws Exception {
        MvcResult result = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("username", username, "password", "senha123", "name", "Outro"))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }

    private MvcResult createTransaction(String token, String type, double amount, long categoryId, String date) throws Exception {
        return mockMvc.perform(post("/transactions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "amount", amount,
                                "type", type,
                                "categoryId", categoryId,
                                "date", date))))
                .andExpect(status().isCreated())
                .andReturn();
    }
}
