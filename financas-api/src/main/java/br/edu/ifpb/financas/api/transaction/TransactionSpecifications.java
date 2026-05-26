package br.edu.ifpb.financas.api.transaction;

import br.edu.ifpb.financas.api.user.AppUser;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class TransactionSpecifications {

    public static Specification<Transaction> byUser(AppUser user) {
        return (root, query, cb) -> cb.equal(root.get("user"), user);
    }

    public static Specification<Transaction> byType(TransactionType type) {
        return (root, query, cb) -> cb.equal(root.get("type"), type);
    }

    public static Specification<Transaction> byCategoryId(Long categoryId) {
        return (root, query, cb) -> cb.equal(root.get("category").get("id"), categoryId);
    }

    public static Specification<Transaction> byStartDate(LocalDate startDate) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("date"), startDate);
    }

    public static Specification<Transaction> byEndDate(LocalDate endDate) {
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("date"), endDate);
    }
}
