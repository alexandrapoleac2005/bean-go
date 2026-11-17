package com.cafe.bean_go.services;

import com.cafe.bean_go.dtos.loyalty.PointTransactionResponseDTO;
import com.cafe.bean_go.entities.PointTransaction;
import com.cafe.bean_go.mappers.PointTransactionMapper;
import com.cafe.bean_go.repositories.PointTransactionRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PointTransactionService {

    private final PointTransactionRepository pointTransactionRepository;
    private final PointTransactionMapper pointTransactionMapper;


    @Transactional(readOnly = true)
    public Page<PointTransactionResponseDTO> getPointTransactions(Long merchantId, Long customerId, Long coffeeShopId,
                                                                  LocalDateTime from, LocalDateTime to,
                                                                  int page, int size) {

        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id")));

        Specification<PointTransaction> filters = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (merchantId != null) {
                predicates.add(cb.equal(root.get("merchant").get("id"), merchantId));
            }
            if (customerId != null) {
                predicates.add(cb.equal(root.get("user").get("id"), customerId));
            }
            if (coffeeShopId != null) {
                predicates.add(cb.equal(root.get("coffeeShop").get("id"), coffeeShopId));
            }
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from));
            }
            if (to != null) {
                predicates.add(cb.lessThan(root.get("createdAt"), to));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return pointTransactionRepository.findAll(filters, pageable)
                .map(pointTransactionMapper::toResponseDto);
    }
}
