package com.cafe.bean_go.dtos.voucher;

import com.cafe.bean_go.entities.enums.VoucherStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class VoucherResponseDTO {

    private Long id;
    private String coffeeShopName;
    private VoucherStatus status;
    private LocalDateTime generatedAt;
    private LocalDateTime expiresAt;
}
