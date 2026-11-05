package com.cafe.bean_go.repositories;

import com.cafe.bean_go.entities.Facility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FacilityRepository extends JpaRepository<Facility,Long> {
}
