package com.cafe.bean_go.controllers;

import com.cafe.bean_go.dtos.review.ReviewRequestDTO;
import com.cafe.bean_go.dtos.review.ReviewResponseDTO;
import com.cafe.bean_go.services.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
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
    public ResponseEntity<List<ReviewResponseDTO>> getCoffeeShopReviews(@PathVariable Long coffeeShopId){
        List<ReviewResponseDTO> reviewResponseDTOList = reviewService.getCoffeeShopReviews(coffeeShopId);
        return ResponseEntity.ok(reviewResponseDTOList);
    }

    @GetMapping("/users/{userId}/reviews")
    public ResponseEntity<List<ReviewResponseDTO>> getUserReviews(@PathVariable Long userId){
        List<ReviewResponseDTO> reviewResponseDTOList = reviewService.getUserReviews(userId);
        return ResponseEntity.ok(reviewResponseDTOList);
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId, @RequestParam Long userId){
        reviewService.deleteReview(reviewId, userId);
        return ResponseEntity.noContent().build();
    }

}
