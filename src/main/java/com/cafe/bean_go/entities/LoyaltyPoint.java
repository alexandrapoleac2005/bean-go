package com.cafe.bean_go.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "loyalty_points", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "coffee_shop_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoyaltyPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coffee_shop_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private CoffeeShop coffeeShop;

    @Builder.Default
    @Column(nullable = false)
    private Integer points = 0;
}
