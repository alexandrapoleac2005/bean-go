package com.cafe.bean_go.repositories;

import com.cafe.bean_go.entities.OperatingHours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OperatingHoursRepository extends JpaRepository<OperatingHours,Long> {
}
