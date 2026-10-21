package com.cafe.bean_go.repositories;

import com.cafe.bean_go.entities.CoffeeShop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CoffeeShopRepository extends JpaRepository<CoffeeShop,Long> {
    List<CoffeeShop> findByIsApprovedTrue();}
