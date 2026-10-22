package com.cafe.bean_go.controllers;

import com.cafe.bean_go.dtos.review.ReviewRequestDTO;
import com.cafe.bean_go.dtos.review.ReviewResponseDTO;
import com.cafe.bean_go.services.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/coffee-shops/{coffeeShopId}/reviews")
    public ResponseEntity<Void> addReview(
            @PathVariable Long coffeeShopId,
            @RequestParam Long userId,
            @Valid @RequestBody ReviewRequestDTO reviewRequestDTO){
        reviewService.addReview(userId, coffeeShopId, reviewRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/coffee-shops/{coffeeShopId}/reviews")
    public ResponseEntity<Page<ReviewResponseDTO>> getCoffeeShopReviews(
            @PathVariable Long coffeeShopId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<ReviewResponseDTO> reviews = reviewService.getCoffeeShopReviews(coffeeShopId, page, size);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/users/{userId}/reviews")
    public ResponseEntity<Page<ReviewResponseDTO>> getUserReviews(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<ReviewResponseDTO> reviews = reviewService.getUserReviews(userId, page, size);
        return ResponseEntity.ok(reviews);
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId, @RequestParam Long userId){
        reviewService.deleteReview(reviewId, userId);
        return ResponseEntity.noContent().build();
    }

}
