package com.cafe.bean_go.services;

import com.cafe.bean_go.dtos.review.ReviewRequestDTO;
import com.cafe.bean_go.dtos.review.ReviewResponseDTO;
import com.cafe.bean_go.entities.CoffeeShop;
import com.cafe.bean_go.entities.Review;
import com.cafe.bean_go.entities.User;
import com.cafe.bean_go.exceptions.ResourceNotFoundException;
import com.cafe.bean_go.exceptions.ReviewAlreadyExistsException;
import com.cafe.bean_go.exceptions.ReviewOwnershipException;
import com.cafe.bean_go.mappers.ReviewMapper;
import com.cafe.bean_go.repositories.CoffeeShopRepository;
import com.cafe.bean_go.repositories.ReviewRepository;
import com.cafe.bean_go.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;
    private final UserRepository userRepository;
    private final CoffeeShopRepository coffeeShopRepository;

    @Transactional
    public void addReview(Long userId, Long coffeeShopId, ReviewRequestDTO reviewRequestDTO){

        if (reviewRepository.existsByUserIdAndCoffeeShopId(userId, coffeeShopId)) {
            throw new ReviewAlreadyExistsException("You have already reviewed this coffee shop.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User with ID: " + userId + " was not found."));

        CoffeeShop coffeeShop = coffeeShopRepository.findById(coffeeShopId)
                .orElseThrow(() -> new ResourceNotFoundException("Coffee shop with ID: " + coffeeShopId + " was not found."));

        Review review = reviewMapper.toEntity(reviewRequestDTO);
        review.setUser(user);
        review.setCoffeeShop(coffeeShop);

        reviewRepository.save(review);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponseDTO> getCoffeeShopReviews(Long coffeeShopId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        return reviewRepository.findByCoffeeShopId(coffeeShopId, pageable)
                .map(reviewMapper::toResponseDto);
    }

    public Double getCoffeeShopAverageRating(Long coffeeShopId) {
        Double average = reviewRepository.getAverageRatingForCoffeeShop(coffeeShopId);
        if(average != null) return average;
        else return 0.0;
    }

    @Transactional
    public void deleteReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found."));

        if (!review.getUser().getId().equals(userId)) {
            throw new ReviewOwnershipException("You do not have permission to delete this review.");
        }

        reviewRepository.delete(review);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponseDTO> getUserReviews(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        return reviewRepository.findByUserId(userId, pageable)
                .map(reviewMapper::toResponseDto);
    }
}
