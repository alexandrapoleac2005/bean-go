package com.cafe.bean_go.mappers;

import com.cafe.bean_go.dtos.favorite.FavoriteResponseDTO;
import com.cafe.bean_go.entities.Favorite;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FavoriteMapper {

    @Mapping(source = "coffeeShop.id", target = "coffeeShopId")
    @Mapping(source = "coffeeShop.name", target = "coffeeShopName")
    @Mapping(source = "coffeeShop.address", target = "coffeeShopAddress")
    FavoriteResponseDTO toResponseDto(Favorite favorite);
}