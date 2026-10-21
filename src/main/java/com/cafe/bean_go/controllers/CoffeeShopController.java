package com.cafe.bean_go.controllers;

import com.cafe.bean_go.dtos.coffeeshop.CoffeeShopDetailsDTO;
import com.cafe.bean_go.dtos.coffeeshop.CoffeeShopSummaryDTO;
import com.cafe.bean_go.services.CoffeeShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/coffeeshops")
@RequiredArgsConstructor
public class CoffeeShopController {

    private final CoffeeShopService coffeeShopService;

    @GetMapping
    public ResponseEntity<List<CoffeeShopSummaryDTO>> getAllCoffeeShops()
    {
        return ResponseEntity.ok(coffeeShopService.getAllCoffeeShopsSummary());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CoffeeShopDetailsDTO> getCoffeeShopById(@PathVariable Long id)
    {
        return ResponseEntity.ok(coffeeShopService.getCoffeeShopById(id));
    }

}
