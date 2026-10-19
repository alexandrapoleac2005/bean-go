package com.cafe.bean_go.dtos.voucher;

import com.cafe.bean_go.entities.enums.VoucherStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class VoucherResponseDTO {

    private Long id;
    private String coffeeShopName;
    private VoucherStatus status;
    private LocalDateTime generatedAt;
    private LocalDateTime expiresAt;
}
