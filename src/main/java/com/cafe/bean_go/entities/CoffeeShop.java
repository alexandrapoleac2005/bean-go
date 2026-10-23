package com.cafe.bean_go.entities;

import jakarta.persistence.*;
import lombok.*;

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
    @OneToMany(mappedBy = "coffeeShop", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MenuItem> menuItems = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "coffeeShop", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OperatingHours> operatingHours = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "coffeeShop", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Review> reviews = new ArrayList<>();

    @Column(name = "average_rating")
    private Double averageRating = 0.0;

    public void addReview(Review review) {
        reviews.add(review);
        review.setCoffeeShop(this);
        updateAverageRating();
    }

    public void removeReview(Review review) {
        reviews.remove(review);
        review.setCoffeeShop(null);
        updateAverageRating();
    }

    private void updateAverageRating() {
        if (reviews.isEmpty()) {
            this.averageRating = 0.0;
            return;
        }

        double sum = reviews.stream()
                .mapToDouble(Review::getRating)
                .sum();

        this.averageRating = Math.round((sum / reviews.size()) * 10.0) / 10.0;
    }

}

