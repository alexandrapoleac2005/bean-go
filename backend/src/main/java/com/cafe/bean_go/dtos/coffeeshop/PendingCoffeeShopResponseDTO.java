package com.cafe.bean_go.dtos.coffeeshop;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// A cafe waiting for admin approval, with who submitted it.
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingCoffeeShopResponseDTO {
    private Long id;
    private String name;
    private String address;
    private String description;
    private Double latitude;
    private Double longitude;
    private String contactEmail;
    private String contactPhone;

    private Long merchantId;
    private String merchantName;
    private String merchantEmail;
}
