package com.cafe.bean_go.mappers;

import com.cafe.bean_go.dtos.loyalty.PointTransactionResponseDTO;
import com.cafe.bean_go.entities.PointTransaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PointTransactionMapper {

    @Mapping(source = "merchant.id", target = "merchantId")
    @Mapping(source = "merchant.email", target = "merchantEmail")
    @Mapping(source = "user.id", target = "customerId")
    @Mapping(source = "user.email", target = "customerEmail")
    @Mapping(source = "coffeeShop.id", target = "coffeeShopId")
    @Mapping(source = "coffeeShop.name", target = "coffeeShopName")
    PointTransactionResponseDTO toResponseDto(PointTransaction pointTransaction);
}
