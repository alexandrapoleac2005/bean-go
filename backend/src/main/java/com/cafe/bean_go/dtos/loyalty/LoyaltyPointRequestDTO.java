package com.cafe.bean_go.dtos.loyalty;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
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

    // Identify the customer by ID or by email (the counter usually only knows the email).
    private Long userId;

    @Email(message = "Invalid customer email")
    private String customerEmail;

    @NotNull(message = "Coffee Shop ID is mandatory")
    private Long coffeeShopId;

    @NotNull(message = "Points to add is mandatory")
    @Min(value = 1, message = "Must add at least 1 point")
    @Max(value = 1000, message = "Cannot add more than 1000 points at once")
    private Integer pointsToAdd;

    @AssertTrue(message = "Customer ID or email is mandatory")
    public boolean isCustomerProvided() {
        return userId != null || (customerEmail != null && !customerEmail.isBlank());
    }
}
