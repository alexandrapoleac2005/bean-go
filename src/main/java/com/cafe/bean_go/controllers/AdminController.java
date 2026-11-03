package com.cafe.bean_go.controllers;

import com.cafe.bean_go.dtos.loyalty.PointTransactionResponseDTO;
import com.cafe.bean_go.services.PointTransactionService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

// Every endpoint in this controller is admin-only.
@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final PointTransactionService pointTransactionService;

    @GetMapping("/point-transactions")
    public ResponseEntity<Page<PointTransactionResponseDTO>> getPointTransactions(
            @RequestParam(required = false) Long merchantId,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long coffeeShopId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {

        return ResponseEntity.ok(pointTransactionService.getPointTransactions(
                merchantId, customerId, coffeeShopId, from, to, page, size));
    }
}
