package com.cafe.bean_go.repositories;

import com.cafe.bean_go.entities.LoyaltyPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoyaltyPointRepository extends JpaRepository<LoyaltyPoint, Long> {

    Optional<LoyaltyPoint> findByUserIdAndCoffeeShopId(Long userId, Long coffeeShopId);

    List<LoyaltyPoint> findAllByUserId(Long userId);
}
