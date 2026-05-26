package br.edu.ifpb.financas.api.transaction;

import br.edu.ifpb.financas.api.category.Category;
import br.edu.ifpb.financas.api.category.CategoryRepository;
import br.edu.ifpb.financas.api.user.AppUser;
import br.edu.ifpb.financas.api.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public Page<TransactionResponse> listTransactions(
            String username,
            TransactionType type,
            Long categoryId,
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable) {
        AppUser user = findUser(username);
        Specification<Transaction> spec = Specification.where(TransactionSpecifications.byUser(user));
        if (type != null) spec = spec.and(TransactionSpecifications.byType(type));
        if (categoryId != null) spec = spec.and(TransactionSpecifications.byCategoryId(categoryId));
        if (startDate != null) spec = spec.and(TransactionSpecifications.byStartDate(startDate));
        if (endDate != null) spec = spec.and(TransactionSpecifications.byEndDate(endDate));
        return transactionRepository.findAll(spec, pageable).map(TransactionResponse::from);
    }

    public TransactionResponse getTransaction(String username, Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transação não encontrada"));
        if (!transaction.getUser().getUsername().equals(username)) {
            throw new AccessDeniedException("Acesso negado");
        }
        return TransactionResponse.from(transaction);
    }

    public TransactionResponse createTransaction(String username, CreateTransactionRequest request) {
        AppUser user = findUser(username);
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new EntityNotFoundException("Categoria não encontrada"));

        Transaction transaction = Transaction.builder()
                .amount(request.amount())
                .type(request.type())
                .description(request.description())
                .date(request.date())
                .tag(request.tag())
                .user(user)
                .category(category)
                .build();

        return TransactionResponse.from(transactionRepository.save(transaction));
    }

    public TransactionResponse updateTransaction(String username, Long id, CreateTransactionRequest request) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transação não encontrada"));
        if (!transaction.getUser().getUsername().equals(username)) {
            throw new AccessDeniedException("Acesso negado");
        }
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new EntityNotFoundException("Categoria não encontrada"));

        transaction.setAmount(request.amount());
        transaction.setType(request.type());
        transaction.setDescription(request.description());
        transaction.setDate(request.date());
        transaction.setTag(request.tag());
        transaction.setCategory(category);

        return TransactionResponse.from(transactionRepository.save(transaction));
    }

    public void deleteTransaction(String username, Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transação não encontrada"));
        if (!transaction.getUser().getUsername().equals(username)) {
            throw new AccessDeniedException("Acesso negado");
        }
        transactionRepository.delete(transaction);
    }

    private AppUser findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));
    }
}
