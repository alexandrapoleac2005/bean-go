package com.cafe.bean_go.dtos.menu;

import lombok.*;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MenuItemDTO {
    private Long id;
    private String category;
    private String name;
    private BigDecimal price;
    private String description;
}
