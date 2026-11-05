package com.cafe.bean_go.repositories;

import com.cafe.bean_go.entities.LoyaltyPoint;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoyaltyPointRepository extends JpaRepository<LoyaltyPoint, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<LoyaltyPoint> findByUserIdAndCoffeeShopId(Long userId, Long coffeeShopId);

    @EntityGraph(attributePaths = "coffeeShop")
    List<LoyaltyPoint> findAllByUserId(Long userId);
}
