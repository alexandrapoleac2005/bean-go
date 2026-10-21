package com.cafe.bean_go.repositories;

import com.cafe.bean_go.entities.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByCoffeeShopId(Long coffeeShopId);

    List<Review> findByUserId(Long userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.coffeeShop.id = :coffeeShopId")
    Double getAverageRatingForCoffeeShop(@Param("coffeeShopId") Long coffeeShopId);

    boolean existsByUserIdAndCoffeeShopId(Long userId, Long coffeeShopId);
}
