package com.cafe.bean_go.controllers;

import com.cafe.bean_go.dtos.coffeeshop.CoffeeShopDetailsResponseDTO;
import com.cafe.bean_go.dtos.coffeeshop.CoffeeShopUpdateRequestDTO;
import com.cafe.bean_go.dtos.coffeeshop.MerchantCoffeeShopResponseDTO;
import com.cafe.bean_go.dtos.facility.FacilityResponseDTO;
import com.cafe.bean_go.security.CustomUserDetails;
import com.cafe.bean_go.services.CoffeeShopService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/merchant")
@PreAuthorize("hasRole('MERCHANT')")
@RequiredArgsConstructor
public class MerchantController {

    private final CoffeeShopService coffeeShopService;

    @GetMapping("/coffee-shops")
    public ResponseEntity<List<MerchantCoffeeShopResponseDTO>> getMyCoffeeShops(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(coffeeShopService.getMerchantCoffeeShops(currentUser.getUser().getId()));
    }

    @GetMapping("/coffee-shops/{id}")
    public ResponseEntity<CoffeeShopDetailsResponseDTO> getMyCoffeeShop(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(coffeeShopService.getMerchantCoffeeShop(id, currentUser.getUser().getId()));
    }

    @PutMapping("/coffee-shops/{id}")
    public ResponseEntity<CoffeeShopDetailsResponseDTO> updateMyCoffeeShop(
            @PathVariable Long id,
            @Valid @RequestBody CoffeeShopUpdateRequestDTO request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(coffeeShopService.updateCoffeeShop(id, currentUser.getUser().getId(), request));
    }

    @GetMapping("/facilities")
    public ResponseEntity<List<FacilityResponseDTO>> getFacilities() {
        return ResponseEntity.ok(coffeeShopService.getAllFacilities());
    }
}
