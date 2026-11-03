package com.cafe.bean_go.repositories;

import com.cafe.bean_go.entities.Voucher;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {

    List<Voucher> findByUserId(Long userId);

    // Locks the row so the same code can't be redeemed twice at the same moment.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM Voucher v WHERE v.code = :code")
    Optional<Voucher> findByCodeForUpdate(@Param("code") String code);

    @Query("SELECT v FROM Voucher v LEFT JOIN FETCH v.coffeeShop WHERE v.user.id = :userId " +
            "AND v.status = com.cafe.bean_go.entities.enums.VoucherStatus.ACTIVE " +
            "AND (v.expiresAt IS NULL OR v.expiresAt > :now)")
    List<Voucher> findUsableByUserId(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    // Numar vouchere active (neexpirate) per user la o cafenea
    @Query("SELECT COUNT(v) FROM Voucher v " +
            "WHERE v.user.id = :userId " +
            "AND v.coffeeShop.id = :coffeeShopId " +
            "AND v.status = com.cafe.bean_go.entities.enums.VoucherStatus.ACTIVE " +
            "AND (v.expiresAt IS NULL OR v.expiresAt > :now)")
    long countUsableByUserIdAndCoffeeShopId(@Param("userId") Long userId,
                                            @Param("coffeeShopId") Long coffeeShopId,
                                            @Param("now") LocalDateTime now);
}
