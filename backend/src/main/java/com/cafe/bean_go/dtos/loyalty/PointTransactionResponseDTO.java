package com.cafe.bean_go.dtos.loyalty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PointTransactionResponseDTO {

    private Long id;
    private LocalDateTime createdAt;
    private Integer points;

    private Long merchantId;
    private String merchantEmail;

    private Long customerId;
    private String customerEmail;

    private Long coffeeShopId;
    private String coffeeShopName;
}
