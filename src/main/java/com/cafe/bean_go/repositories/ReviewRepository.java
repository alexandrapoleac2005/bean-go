package com.cafe.bean_go.repositories;

import com.cafe.bean_go.entities.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByCoffeeShopId(Long coffeeShopId, Pageable pageable);

    Page<Review> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.coffeeShop.id = :coffeeShopId")
    Double getAverageRatingForCoffeeShop(@Param("coffeeShopId") Long coffeeShopId);

    boolean existsByUserIdAndCoffeeShopId(Long userId, Long coffeeShopId);
}
