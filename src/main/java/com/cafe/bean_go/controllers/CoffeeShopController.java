package com.cafe.bean_go.controllers;

import com.cafe.bean_go.dtos.coffeeshop.CoffeeShopDetailsResponseDTO;
import com.cafe.bean_go.dtos.coffeeshop.CoffeeShopRequestDTO;
import com.cafe.bean_go.dtos.coffeeshop.CoffeeShopSummaryResponseDTO;
import com.cafe.bean_go.dtos.menu.MenuItemRequestDTO;
import com.cafe.bean_go.services.CoffeeShopService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<CoffeeShopDetailsResponseDTO> addMenuItem(
            @PathVariable Long id,
            @RequestParam Long merchantId,
            @Valid @RequestBody MenuItemRequestDTO itemDto) {

        return ResponseEntity.status(HttpStatus.CREATED).body(coffeeShopService.addMenuItemToCoffeeShop(id, merchantId, itemDto));
    }

    @PutMapping("/{coffeeShopId}/menu/{itemId}")
    public ResponseEntity<CoffeeShopDetailsResponseDTO> updateMenuItem(
            @PathVariable Long coffeeShopId,
            @PathVariable Long itemId,
            @RequestParam Long merchantId,
            @Valid @RequestBody MenuItemRequestDTO itemDto) {

        return ResponseEntity.ok(coffeeShopService.updateMenuItem(coffeeShopId, merchantId, itemId, itemDto));
    }

    @DeleteMapping("/{coffeeShopId}/menu/{itemId}")
    public ResponseEntity<Void> removeMenuItem(
            @PathVariable Long coffeeShopId,
            @PathVariable Long itemId,
            @RequestParam Long merchantId) {

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
    public ResponseEntity<Void> approveCoffeeShop(@PathVariable Long id) {
        coffeeShopService.approveCoffeeShop(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<CoffeeShopDetailsResponseDTO> createCoffeeShop(
            @Valid @RequestBody CoffeeShopRequestDTO requestDTO) {

        CoffeeShopDetailsResponseDTO createdShop = coffeeShopService.createCoffeeShop(requestDTO);

        return ResponseEntity.status(HttpStatus.CREATED).body(createdShop);
    }

}