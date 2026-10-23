package com.cafe.bean_go.controllers;

import com.cafe.bean_go.dtos.favorite.FavoriteResponseDTO;
import com.cafe.bean_go.services.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping("/users/{userId}/favorites")
    public ResponseEntity<Page<FavoriteResponseDTO>> getUserFavorites(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<FavoriteResponseDTO> favorites = favoriteService.getUserFavorites(userId, page, size);
        return ResponseEntity.ok(favorites);
    }

    @PostMapping("/users/{userId}/favorites/{coffeeShopId}")
    public ResponseEntity<Void> addFavorite(@PathVariable Long userId, @PathVariable Long coffeeShopId){
        favoriteService.addFavorite(userId, coffeeShopId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/favorites/{favoriteId}")
    public ResponseEntity<Void> removeFavorite(@PathVariable Long favoriteId, @RequestParam Long userId){
        favoriteService.removeFavorite(favoriteId, userId);
        return ResponseEntity.noContent().build();
    }
}
