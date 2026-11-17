package com.cafe.bean_go.dtos.loyalty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class LoyaltyPointResponseDTO {
    private Long coffeeShopId;
    private String coffeeShopName;
    private Integer points;
}
