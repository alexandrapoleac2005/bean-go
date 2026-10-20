package com.cafe.bean_go.services;

import com.cafe.bean_go.dtos.favorite.FavoriteResponseDTO;
import com.cafe.bean_go.entities.CoffeeShop;
import com.cafe.bean_go.entities.Favorite;
import com.cafe.bean_go.entities.User;
import com.cafe.bean_go.exceptions.FavoriteAlreadyExistsException;
import com.cafe.bean_go.exceptions.FavoriteOwnershipException;
import com.cafe.bean_go.exceptions.ResourceNotFoundException;
import com.cafe.bean_go.mappers.FavoriteMapper;
import com.cafe.bean_go.repositories.CoffeeShopRepository;
import com.cafe.bean_go.repositories.FavoriteRepository;
import com.cafe.bean_go.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final FavoriteMapper favoriteMapper;
    private final UserRepository userRepository;
    private final CoffeeShopRepository coffeeShopRepository;

    public List<FavoriteResponseDTO> getUserFavorites(Long userId) {
        return favoriteRepository.findByUserId(userId)
                .stream()
                .map(favoriteMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void addFavorite(Long userId, Long coffeeShopId){
        if(favoriteRepository.existsByUserIdAndCoffeeShopId(userId, coffeeShopId)){
            throw new FavoriteAlreadyExistsException("The coffee shop is already in the wishlist");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User with ID: " + userId + " was not found."));

        CoffeeShop coffeeShop = coffeeShopRepository.findById(coffeeShopId)
                .orElseThrow(() -> new ResourceNotFoundException("Coffee shop with ID: " + coffeeShopId + " was not found."));

        Favorite favorite = Favorite.builder()
                .user(user)
                .coffeeShop(coffeeShop)
                .build();

        favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFavorite(Long favoriteId, Long userId){
        Favorite favorite = favoriteRepository.findById(favoriteId)
                .orElseThrow(() -> new ResourceNotFoundException("The record was not found."));

        if (!favorite.getUser().getId().equals(userId)) {
            throw new FavoriteOwnershipException("You do not have permission to delete this record.");
        }

        favoriteRepository.delete(favorite);
    }
}
