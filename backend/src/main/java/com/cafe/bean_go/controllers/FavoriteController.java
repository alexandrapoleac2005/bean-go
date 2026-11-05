package com.cafe.bean_go.controllers;

import com.cafe.bean_go.dtos.favorite.FavoriteResponseDTO;
import com.cafe.bean_go.entities.User;
import com.cafe.bean_go.security.CustomUserDetails;
import com.cafe.bean_go.services.FavoriteService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping("/favorites")
    public ResponseEntity<Page<FavoriteResponseDTO>> getUserFavorites(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) int size) {

        Long realUserId = currentUser.getUser().getId();
        Page<FavoriteResponseDTO> favorites = favoriteService.getUserFavorites(realUserId, page, size);
        return ResponseEntity.ok(favorites);
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/favorites/{coffeeShopId}")
    public ResponseEntity<Void> addFavorite(@PathVariable Long coffeeShopId, @AuthenticationPrincipal CustomUserDetails currentUser){

        Long realUserId = currentUser.getUser().getId();
        favoriteService.addFavorite(realUserId, coffeeShopId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/favorites/{favoriteId}")
    public ResponseEntity<Void> removeFavorite(@PathVariable Long favoriteId, @AuthenticationPrincipal CustomUserDetails currentUser){

        Long realUserId = currentUser.getUser().getId();
        favoriteService.removeFavorite(favoriteId, realUserId);
        return ResponseEntity.noContent().build();
    }
}
