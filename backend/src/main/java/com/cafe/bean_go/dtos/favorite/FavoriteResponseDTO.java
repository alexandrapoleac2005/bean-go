package com.cafe.bean_go.dtos.favorite;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class FavoriteResponseDTO {

    private Long id;
    private Long coffeeShopId;

    private String coffeeShopName;
    private String coffeeShopAddress;
}
