package com.cafe.bean_go.repositories;

import com.cafe.bean_go.entities.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findByUserId(Long userId);

    boolean existsByUserIdAndCoffeeShopId(Long userId, Long coffeeShopId);

    Optional<Favorite> findByUserIdAndCoffeeShopId(Long userId, Long coffeeShopId);
}
