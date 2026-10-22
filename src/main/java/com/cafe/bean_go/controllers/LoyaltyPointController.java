package com.cafe.bean_go.controllers;

import com.cafe.bean_go.dtos.loyalty.LoyaltyPointRequestDTO;
import com.cafe.bean_go.dtos.loyalty.LoyaltyPointResponseDTO;
import com.cafe.bean_go.services.LoyaltyPointService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class LoyaltyPointController {

    private final LoyaltyPointService loyaltyPointService;

    @GetMapping("/users/{userId}/loyalty-points")
    public ResponseEntity<List<LoyaltyPointResponseDTO>> getUserWallets(@PathVariable Long userId) {
        List<LoyaltyPointResponseDTO> wallets = loyaltyPointService.getUserWallets(userId);
        return ResponseEntity.ok(wallets);
    }

    @PostMapping("/loyalty-points/transactions")
    public ResponseEntity<Void> addPointsAfterPurchase(@Valid @RequestBody LoyaltyPointRequestDTO requestDTO) {
        loyaltyPointService.addPointsAfterPurchase(
                requestDTO.getUserId(),
                requestDTO.getCoffeeShopId(),
                requestDTO.getPointsToAdd()
        );
        return ResponseEntity.ok().build();
    }
}
