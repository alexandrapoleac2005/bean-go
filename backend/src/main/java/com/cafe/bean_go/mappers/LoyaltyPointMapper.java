package com.cafe.bean_go.mappers;

import com.cafe.bean_go.dtos.loyalty.LoyaltyPointResponseDTO;
import com.cafe.bean_go.entities.LoyaltyPoint;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LoyaltyPointMapper {

    @Mapping(source = "coffeeShop.id", target = "coffeeShopId")
    @Mapping(source = "coffeeShop.name", target = "coffeeShopName")
    LoyaltyPointResponseDTO toResponseDto(LoyaltyPoint loyaltyPoint);
}
