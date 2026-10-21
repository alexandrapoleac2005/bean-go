package com.cafe.bean_go.dtos.menu;

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
    private String category;
    private String name;
    private BigDecimal price;
    private String description;
}
