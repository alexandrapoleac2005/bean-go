package com.cafe.bean_go.repositories;

import com.cafe.bean_go.entities.Voucher;
import com.cafe.bean_go.entities.enums.VoucherStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {

    List<Voucher> findByUserId(Long userId);

    List<Voucher> findByUserIdAndStatus(Long userId, VoucherStatus status);

    long countByUserIdAndCoffeeShopIdAndStatus(Long userId, Long coffeeShopId, VoucherStatus status); // Numar vouchere active per user la o cafenea
}
