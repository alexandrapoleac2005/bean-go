package com.cafe.bean_go.dtos.menu;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MenuItemRequestDTO {

    @NotBlank(message = "Category is required")
    @Size(max = 100)
    private String category;

    @NotBlank(message = "Product name is required")
    @Size(max = 255)
    private String name;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be greater than 0")
    @Digits(integer = 8, fraction = 2)
    private BigDecimal price;

    private String description;
}
