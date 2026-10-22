package com.cafe.bean_go.entities;

import jakarta.persistence.*;
import lombok.*;

import org.locationtech.jts.geom.Point;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;


@Entity
@Table(name = "coffee_shops")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoffeeShop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "merchant_id", nullable = false)
    private User merchant;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(columnDefinition = "geometry(Point,4326)", nullable = false)
    private Point location;

    @Column(nullable = false)
    private String address;

    @Column(name = "is_approved")
    private Boolean isApproved;

    @ManyToMany
    @JoinTable(
            name = "coffee_shop_facilities",
            joinColumns = @JoinColumn(name = "coffee_shop_id"),
            inverseJoinColumns = @JoinColumn(name = "facility_id")
    )

    @Builder.Default
    private Set<Facility> facilities = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "coffeeShop", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MenuItem> menuItems = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "coffeeShop", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OperatingHours> operatingHours = new ArrayList<>();
}

