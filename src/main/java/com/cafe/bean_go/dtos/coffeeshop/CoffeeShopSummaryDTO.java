package com.cafe.bean_go.dtos.coffeeshop;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoffeeShopSummaryDTO {
    private Long id;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
}