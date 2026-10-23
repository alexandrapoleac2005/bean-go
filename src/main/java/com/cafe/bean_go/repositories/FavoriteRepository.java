package com.cafe.bean_go.repositories;

import com.cafe.bean_go.entities.Favorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    Page<Favorite> findByUserId(Long userId, Pageable pageable);

    boolean existsByUserIdAndCoffeeShopId(Long userId, Long coffeeShopId);

    Optional<Favorite> findByUserIdAndCoffeeShopId(Long userId, Long coffeeShopId);
}
