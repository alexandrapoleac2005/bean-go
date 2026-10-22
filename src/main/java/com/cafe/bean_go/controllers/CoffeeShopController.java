package com.cafe.bean_go.controllers;

import com.cafe.bean_go.dtos.coffeeshop.CoffeeShopDetailsResponseDTO;
import com.cafe.bean_go.dtos.coffeeshop.CoffeeShopSummaryResponseDTO;
import com.cafe.bean_go.dtos.menu.MenuItemRequestDTO;
import com.cafe.bean_go.services.CoffeeShopService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/coffeeshops")
@RequiredArgsConstructor
public class CoffeeShopController {

    private final CoffeeShopService coffeeShopService;

    @GetMapping
    public ResponseEntity<List<CoffeeShopSummaryResponseDTO>> getAllCoffeeShops() {
        return ResponseEntity.ok(coffeeShopService.getAllCoffeeShopsSummary());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CoffeeShopDetailsResponseDTO> getCoffeeShopById(@PathVariable Long id) {
        return ResponseEntity.ok(coffeeShopService.getCoffeeShopById(id));
    }

    @PostMapping("/{id}/menu")
    public ResponseEntity<CoffeeShopDetailsResponseDTO> addMenuItem(
            @PathVariable Long id,
            @Valid @RequestBody MenuItemRequestDTO itemDto) {

        return ResponseEntity.status(HttpStatus.CREATED).body(coffeeShopService.addMenuItemToCoffeeShop(id, itemDto));
    }

    @PutMapping("/{coffeeShopId}/menu/{itemId}")
    public ResponseEntity<CoffeeShopDetailsResponseDTO> updateMenuItem(
            @PathVariable Long coffeeShopId,
            @PathVariable Long itemId,
            @Valid @RequestBody MenuItemRequestDTO itemDto) {

        return ResponseEntity.ok(coffeeShopService.updateMenuItem(coffeeShopId, itemId, itemDto));
    }

    @DeleteMapping("/{coffeeShopId}/menu/{itemId}")
    public ResponseEntity<Void> removeMenuItem(
            @PathVariable Long coffeeShopId,
            @PathVariable Long itemId) {

        coffeeShopService.deleteMenuItem(coffeeShopId, itemId);

        return ResponseEntity.noContent().build();
    }


}