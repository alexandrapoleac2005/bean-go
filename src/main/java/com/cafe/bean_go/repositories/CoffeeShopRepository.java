package com.cafe.bean_go.repositories;

import com.cafe.bean_go.entities.CoffeeShop;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CoffeeShopRepository extends JpaRepository<CoffeeShop, Long> {
    Page<CoffeeShop> findByIsApprovedTrue(Pageable pageable);

    @Query(value = "SELECT * FROM coffee_shops " +
            "WHERE is_approved = true " +
            "AND ST_DWithin(location\\:\\:geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)\\:\\:geography, :radiusInMeters)",
            nativeQuery = true)
    List<CoffeeShop> findNearbyCoffeeShops(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusInMeters") double radiusInMeters
    );

    List<CoffeeShop> findByMerchantId(Long merchantId);

}
