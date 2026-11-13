package com.cafe.bean_go.dtos.coffeeshop;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// One of the logged-in merchant's cafes, approved or still waiting.
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MerchantCoffeeShopResponseDTO {
    private Long id;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private Boolean approved;
}
