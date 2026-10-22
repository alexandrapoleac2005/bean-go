package com.cafe.bean_go.controllers;

import com.cafe.bean_go.dtos.voucher.VoucherResponseDTO;
import com.cafe.bean_go.services.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherService voucherService;

    @GetMapping("/users/{userId}/vouchers/active")
    public ResponseEntity<List<VoucherResponseDTO>> getActiveVouchers(@PathVariable Long userId) {
        List<VoucherResponseDTO> voucherResponseDTOList = voucherService.getActiveVouchers(userId);
        return ResponseEntity.ok(voucherResponseDTOList);
    }

    @PatchMapping("/vouchers/{voucherId}")
    public ResponseEntity<Void> useVoucher(@PathVariable Long voucherId, @RequestParam Long userId) {
        voucherService.useVoucher(voucherId, userId);
        return ResponseEntity.noContent().build();
    }
}
