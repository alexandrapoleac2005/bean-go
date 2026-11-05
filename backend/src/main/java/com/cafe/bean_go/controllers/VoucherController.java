package com.cafe.bean_go.controllers;

import com.cafe.bean_go.dtos.voucher.VoucherRedeemRequestDTO;
import com.cafe.bean_go.dtos.voucher.VoucherResponseDTO;
import com.cafe.bean_go.security.CustomUserDetails;
import com.cafe.bean_go.services.VoucherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherService voucherService;

    @GetMapping("/vouchers/active")
    public ResponseEntity<List<VoucherResponseDTO>> getActiveVouchers(@AuthenticationPrincipal CustomUserDetails currentUser) {

        Long realUserId = currentUser.getUser().getId();
        List<VoucherResponseDTO> voucherResponseDTOList = voucherService.getActiveVouchers(realUserId);
        return ResponseEntity.ok(voucherResponseDTOList);
    }

    @PreAuthorize("hasRole('MERCHANT')")
    @PostMapping("/vouchers/redeem")
    public ResponseEntity<VoucherResponseDTO> redeemVoucher(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody VoucherRedeemRequestDTO requestDTO) {

        Long merchantId = currentUser.getUser().getId();
        return ResponseEntity.ok(voucherService.redeemVoucher(requestDTO.getCode(), merchantId));
    }
}
