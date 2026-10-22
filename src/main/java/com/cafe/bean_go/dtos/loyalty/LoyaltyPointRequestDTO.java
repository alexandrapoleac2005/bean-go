package com.cafe.bean_go.dtos.loyalty;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class LoyaltyPointRequestDTO {

    @NotNull(message = "User ID is mandatory")
    private Long userId;

    @NotNull(message = "Coffee Shop ID is mandatory")
    private Long coffeeShopId;

    @NotNull(message = "Points to add is mandatory")
    @Min(value = 1, message = "Must add at least 1 point")
    private Integer pointsToAdd;
}
