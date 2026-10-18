package com.cafe.bean_go.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MenuItem extends JpaRepository<MenuItem,Long> {
}
