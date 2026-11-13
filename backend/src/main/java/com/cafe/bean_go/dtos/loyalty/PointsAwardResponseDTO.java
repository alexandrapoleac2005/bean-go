package com.cafe.bean_go.dtos.loyalty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// What the merchant sees after awarding points at the counter.
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PointsAwardResponseDTO {
    private String customerName;
    private String customerEmail;
    private String coffeeShopName;
    private Integer pointsAdded;
    private Integer walletPoints;
    private Integer vouchersIssued;
}
