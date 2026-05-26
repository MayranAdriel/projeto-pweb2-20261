package br.edu.ifpb.financas.api.transaction;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateTransactionRequest(
        @NotNull @Positive BigDecimal amount,
        @NotNull TransactionType type,
        @NotNull Long categoryId,
        @NotNull LocalDate date,
        String description,
        String tag) {}
