package com.cafe.bean_go.mappers;

import com.cafe.bean_go.dtos.review.ReviewRequestDTO;
import com.cafe.bean_go.dtos.review.ReviewResponseDTO;
import com.cafe.bean_go.entities.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "coffeeShop", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Review toEntity(ReviewRequestDTO requestDTO);

    @Mapping(source = "user.firstName", target = "userFirstName")
    @Mapping(source = "user.lastName", target = "userLastName")
    @Mapping(source = "coffeeShop.name", target = "coffeeShopName")
    ReviewResponseDTO toResponseDto(Review review);
}
