package com.cafe.bean_go.entities;

import jakarta.persistence.*;
import lombok.*;

import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.hibernate.annotations.Formula;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
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
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class CoffeeShop {

    @EqualsAndHashCode.Include
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

    @Builder.Default
    @Column(name = "is_approved")
    private Boolean isApproved = false;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(name = "contact_email")
    private String contactEmail;

    @ManyToMany
    @JoinTable(
            name = "coffee_shop_facilities",
            joinColumns = @JoinColumn(name = "coffee_shop_id"),
            inverseJoinColumns = @JoinColumn(name = "facility_id")
    )
    @Builder.Default
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Set<Facility> facilities = new HashSet<>();

    @Builder.Default
    @Fetch(FetchMode.SUBSELECT)
    @OneToMany(mappedBy = "coffeeShop", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MenuItem> menuItems = new ArrayList<>();

    @Builder.Default
    @Fetch(FetchMode.SUBSELECT)
    @OneToMany(mappedBy = "coffeeShop", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OperatingHours> operatingHours = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "coffeeShop", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Review> reviews = new ArrayList<>();

    // Kept up to date by ReviewService using a database AVG query.
    @Builder.Default
    @Column(name = "average_rating")
    private Double averageRating = 0.0;

    // Computed by the database when the shop is loaded; not a real column.
    @Formula("(SELECT COUNT(*) FROM reviews r WHERE r.coffee_shop_id = id)")
    private Integer reviewCount;

}

