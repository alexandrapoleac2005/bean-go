package com.cafe.bean_go.repositories;

import com.cafe.bean_go.entities.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem,Long> {
    List<MenuItem> findByCoffeeShopId(Long coffeeShopId);
}
