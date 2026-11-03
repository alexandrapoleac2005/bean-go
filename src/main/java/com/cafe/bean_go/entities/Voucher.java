package com.cafe.bean_go.entities;

import com.cafe.bean_go.entities.enums.VoucherStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Table(name = "vouchers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Voucher {

    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coffee_shop_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private CoffeeShop coffeeShop;

    // Shown to the customer and entered by the merchant at redemption.
    @Column(nullable = false, unique = true, length = 16)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VoucherStatus status;

    @Builder.Default
    @Column(name = "discount_percentage", nullable = false)
    private Integer discountPercentage = 10;

    @CreationTimestamp
    @Column(name = "generated_at", updatable = false)
    private LocalDateTime generatedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
}
