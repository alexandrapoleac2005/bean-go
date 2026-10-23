package com.cafe.bean_go.services;

import com.cafe.bean_go.dtos.voucher.VoucherResponseDTO;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VoucherService {

    private final VoucherRepository voucherRepository;
    private final VoucherMapper voucherMapper;

    @Transactional(readOnly = true)
    public List<VoucherResponseDTO> getActiveVouchers(Long userId) {
        return voucherRepository.findByUserIdAndStatus(userId, VoucherStatus.ACTIVE)
                .stream()
                .map(voucherMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void useVoucher(Long voucherId, Long userId){
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new ResourceNotFoundException("The voucher was not found."));

        if(!voucher.getUser().getId().equals(userId)){
            throw new VoucherOwnershipException("You do not have permission to use this voucher!");
        }

        if(voucher.getStatus() == VoucherStatus.USED){
            throw new VoucherAlreadyUsedException("This voucher was already used");
        }

        if (voucher.getExpiresAt() != null && LocalDateTime.now().isAfter(voucher.getExpiresAt())) {
            throw new VoucherExpiredException("This voucher has expired.");
        }

        voucher.setStatus(VoucherStatus.USED);
        voucherRepository.save(voucher);
    }
}
