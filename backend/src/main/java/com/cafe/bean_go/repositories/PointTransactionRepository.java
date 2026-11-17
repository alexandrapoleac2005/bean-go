package com.cafe.bean_go.repositories;

import com.cafe.bean_go.entities.PointTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface PointTransactionRepository extends JpaRepository<PointTransaction, Long>,
        JpaSpecificationExecutor<PointTransaction> {

    @Override
    @EntityGraph(attributePaths = {"user", "merchant", "coffeeShop"})
    Page<PointTransaction> findAll(Specification<PointTransaction> spec, Pageable pageable);
}
