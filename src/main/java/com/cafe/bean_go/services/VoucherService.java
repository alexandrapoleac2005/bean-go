package com.cafe.bean_go.services;

import com.cafe.bean_go.dtos.voucher.VoucherResponseDTO;
import com.cafe.bean_go.entities.CoffeeShop;
import com.cafe.bean_go.entities.Voucher;
import com.cafe.bean_go.entities.enums.VoucherStatus;
import com.cafe.bean_go.exceptions.ResourceNotFoundException;
import com.cafe.bean_go.exceptions.VoucherAlreadyUsedException;
import com.cafe.bean_go.exceptions.VoucherExpiredException;
import com.cafe.bean_go.exceptions.VoucherOwnershipException;
import com.cafe.bean_go.mappers.VoucherMapper;
import com.cafe.bean_go.repositories.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VoucherService {

    private final VoucherRepository voucherRepository;
    private final VoucherMapper voucherMapper;

    @Transactional(readOnly = true)
    public List<VoucherResponseDTO> getActiveVouchers(Long userId) {
        return voucherRepository.findUsableByUserId(userId, LocalDateTime.now())
                .stream()
                .map(voucherMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    // Called by the merchant at the counter with the code the customer shows them.
    @Transactional
    public VoucherResponseDTO redeemVoucher(String code, Long merchantId) {

        String normalizedCode = code.trim().toUpperCase(Locale.ROOT);

        Voucher voucher = voucherRepository.findByCodeForUpdate(normalizedCode)
                .orElseThrow(() -> new ResourceNotFoundException("The voucher was not found."));

        CoffeeShop shop = voucher.getCoffeeShop();
        if (shop == null || !shop.getMerchant().getId().equals(merchantId)) {
            throw new VoucherOwnershipException("This voucher cannot be redeemed at your coffee shop.");
        }

        if (voucher.getStatus() == VoucherStatus.USED) {
            throw new VoucherAlreadyUsedException("This voucher was already used");
        }

        if (voucher.getExpiresAt() != null && LocalDateTime.now().isAfter(voucher.getExpiresAt())) {
            throw new VoucherExpiredException("This voucher has expired.");
        }

        voucher.setStatus(VoucherStatus.USED);

        // Lets the merchant see which discount to apply.
        return voucherMapper.toResponseDto(voucher);
    }
}
