package com.cafe.bean_go.controllers;

import com.cafe.bean_go.dtos.coffeeshop.CoffeeShopDetailsResponseDTO;
import com.cafe.bean_go.dtos.coffeeshop.CoffeeShopRequestDTO;
import com.cafe.bean_go.dtos.coffeeshop.CoffeeShopSummaryResponseDTO;
import com.cafe.bean_go.dtos.menu.MenuItemRequestDTO;
import com.cafe.bean_go.dtos.schedule.OperatingHoursRequestDTO;
import com.cafe.bean_go.dtos.schedule.OperatingHoursResponseDTO;
import com.cafe.bean_go.entities.OperatingHours;
import com.cafe.bean_go.security.CustomUserDetails;
import com.cafe.bean_go.services.CoffeeShopService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/coffee-shops")
@RequiredArgsConstructor
public class CoffeeShopController {

    private final CoffeeShopService coffeeShopService;

    @GetMapping
    public ResponseEntity<Page<CoffeeShopSummaryResponseDTO>> getAllCoffeeShops(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(coffeeShopService.getAllCoffeeShopsSummary(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CoffeeShopDetailsResponseDTO> getCoffeeShopById(@PathVariable Long id) {
        return ResponseEntity.ok(coffeeShopService.getCoffeeShopById(id));
    }


    @PostMapping("/{id}/menu")
    @PreAuthorize("hasRole('MERCHANT')")
    public ResponseEntity<CoffeeShopDetailsResponseDTO> addMenuItem(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody MenuItemRequestDTO itemDto) {

        Long merchantId = currentUser.getUser().getId();
        return ResponseEntity.status(HttpStatus.CREATED).body(coffeeShopService.addMenuItemToCoffeeShop(id, merchantId, itemDto));
    }

    @PutMapping("/{coffeeShopId}/menu/{itemId}")
    @PreAuthorize("hasRole('MERCHANT')")
    public ResponseEntity<CoffeeShopDetailsResponseDTO> updateMenuItem(
            @PathVariable Long coffeeShopId,
            @PathVariable Long itemId,
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody MenuItemRequestDTO itemDto) {

        Long merchantId = currentUser.getUser().getId();
        return ResponseEntity.ok(coffeeShopService.updateMenuItem(coffeeShopId, merchantId, itemId, itemDto));
    }

    @DeleteMapping("/{coffeeShopId}/menu/{itemId}")
    @PreAuthorize("hasRole('MERCHANT')")
    public ResponseEntity<Void> removeMenuItem(
            @PathVariable Long coffeeShopId,
            @PathVariable Long itemId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        Long merchantId = currentUser.getUser().getId();
        coffeeShopService.deleteMenuItem(coffeeShopId, merchantId, itemId);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<CoffeeShopSummaryResponseDTO>> getNearbyCoffeeShops(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "5000") double radius) {

        List<CoffeeShopSummaryResponseDTO> shops = coffeeShopService.getNearbyCoffeeShops(lat, lng, radius);

        return ResponseEntity.ok(shops);
    }


    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> approveCoffeeShop(@PathVariable Long id) {
        coffeeShopService.approveCoffeeShop(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    @PreAuthorize("hasRole('MERCHANT')")
    public ResponseEntity<CoffeeShopDetailsResponseDTO> createCoffeeShop(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody CoffeeShopRequestDTO requestDTO) {

            Long merchantId = currentUser.getUser().getId();
            CoffeeShopDetailsResponseDTO createdShop = coffeeShopService.createCoffeeShop(merchantId, requestDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdShop);
    }

    @PutMapping("/{id}/schedule")
    @PreAuthorize("hasRole('MERCHANT')")
    public ResponseEntity<List<OperatingHoursResponseDTO>> updateOperatingHours(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody List<OperatingHoursRequestDTO> scheduleRequests) {

        Long merchantId = currentUser.getUser().getId();
        List<OperatingHoursResponseDTO> updateSchedule = coffeeShopService.updateOperatingHours(id, merchantId, scheduleRequests);
        return ResponseEntity.ok(updateSchedule);
    }


}