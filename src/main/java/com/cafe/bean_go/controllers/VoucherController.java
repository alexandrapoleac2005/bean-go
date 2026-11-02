package com.cafe.bean_go.controllers;

import com.cafe.bean_go.dtos.voucher.VoucherResponseDTO;
import com.cafe.bean_go.security.CustomUserDetails;
import com.cafe.bean_go.services.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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

    @PatchMapping("/vouchers/{voucherId}")
    public ResponseEntity<Void> useVoucher(@PathVariable Long voucherId, @AuthenticationPrincipal CustomUserDetails currentUser) {

        Long realUserId = currentUser.getUser().getId();
        voucherService.useVoucher(voucherId, realUserId);
        return ResponseEntity.noContent().build();
    }
}
