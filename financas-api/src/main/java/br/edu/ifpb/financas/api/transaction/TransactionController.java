package br.edu.ifpb.financas.api.transaction;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
@Tag(name = "Transações", description = "Endpoints para gerenciamento de receitas e despesas")
@SecurityRequirement(name = "bearerAuth")
public class TransactionController {

    private final TransactionService transactionService;

    @Operation(
            summary = "Listar transações",
            description = "Retorna as transações do usuário autenticado, paginadas e ordenadas por data decrescente. Suporta filtros opcionais por tipo, categoria e período."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso"),
            @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content)
    })
    @GetMapping
    public ResponseEntity<Page<TransactionResponse>> listTransactions(
            @AuthenticationPrincipal UserDetails principal,
            @Parameter(description = "Filtrar por tipo (INCOME ou EXPENSE)")
            @RequestParam(required = false) TransactionType type,
            @Parameter(description = "Filtrar por ID de categoria")
            @RequestParam(required = false) Long categoryId,
            @Parameter(description = "Data de início do período (yyyy-MM-dd)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "Data de fim do período (yyyy-MM-dd)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(size = 10, sort = "date", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(
                transactionService.listTransactions(principal.getUsername(), type, categoryId, startDate, endDate, pageable));
    }

    @Operation(
            summary = "Buscar transação por ID",
            description = "Retorna uma transação do usuário autenticado pelo seu ID"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Transação encontrada",
                    content = @Content(schema = @Schema(implementation = TransactionResponse.class))),
            @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content),
            @ApiResponse(responseCode = "403", description = "Sem permissão para acessar esta transação", content = @Content),
            @ApiResponse(responseCode = "404", description = "Transação não encontrada", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransaction(
            @AuthenticationPrincipal UserDetails principal,
            @Parameter(description = "ID da transação") @PathVariable Long id) {
        return ResponseEntity.ok(transactionService.getTransaction(principal.getUsername(), id));
    }

    @Operation(
            summary = "Criar transação",
            description = "Registra uma nova receita ou despesa para o usuário autenticado"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Transação criada com sucesso",
                    content = @Content(schema = @Schema(implementation = TransactionResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos na requisição", content = @Content),
            @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content),
            @ApiResponse(responseCode = "404", description = "Categoria não encontrada", content = @Content)
    })
    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @AuthenticationPrincipal UserDetails principal,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Dados da transação",
                    required = true,
                    content = @Content(schema = @Schema(implementation = CreateTransactionRequest.class)))
            @Valid @RequestBody CreateTransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(transactionService.createTransaction(principal.getUsername(), request));
    }

    @Operation(
            summary = "Atualizar transação",
            description = "Atualiza os dados de uma transação do usuário autenticado"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Transação atualizada com sucesso",
                    content = @Content(schema = @Schema(implementation = TransactionResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos na requisição", content = @Content),
            @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content),
            @ApiResponse(responseCode = "403", description = "Sem permissão para editar esta transação", content = @Content),
            @ApiResponse(responseCode = "404", description = "Transação ou categoria não encontrada", content = @Content)
    })
    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> updateTransaction(
            @AuthenticationPrincipal UserDetails principal,
            @Parameter(description = "ID da transação") @PathVariable Long id,
            @Valid @RequestBody CreateTransactionRequest request) {
        return ResponseEntity.ok(transactionService.updateTransaction(principal.getUsername(), id, request));
    }

    @Operation(
            summary = "Excluir transação",
            description = "Remove uma transação do usuário autenticado pelo seu ID"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Transação excluída com sucesso", content = @Content),
            @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content),
            @ApiResponse(responseCode = "403", description = "Sem permissão para excluir esta transação", content = @Content),
            @ApiResponse(responseCode = "404", description = "Transação não encontrada", content = @Content)
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @AuthenticationPrincipal UserDetails principal,
            @Parameter(description = "ID da transação") @PathVariable Long id) {
        transactionService.deleteTransaction(principal.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
