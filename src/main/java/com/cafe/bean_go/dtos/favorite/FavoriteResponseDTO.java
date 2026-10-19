package com.cafe.bean_go.dtos.favorite;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class FavoriteResponseDTO {

    private Long id;
    private Long coffeeShopId;

    private String coffeeShopName;
    private String coffeeShopAddress;
}
