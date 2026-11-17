package com.cafe.bean_go.mappers;

import com.cafe.bean_go.dtos.loyalty.PointTransactionResponseDTO;
import com.cafe.bean_go.entities.PointTransaction;
import com.cafe.bean_go.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PointTransactionMapper {

    @Mapping(source = "merchant.id", target = "merchantId")
    @Mapping(target = "merchantName", expression = "java(fullName(pointTransaction.getMerchant()))")
    @Mapping(source = "merchant.email", target = "merchantEmail")
    @Mapping(source = "user.id", target = "customerId")
    @Mapping(target = "customerName", expression = "java(fullName(pointTransaction.getUser()))")
    @Mapping(source = "user.email", target = "customerEmail")
    @Mapping(source = "coffeeShop.id", target = "coffeeShopId")
    @Mapping(source = "coffeeShop.name", target = "coffeeShopName")
    PointTransactionResponseDTO toResponseDto(PointTransaction pointTransaction);

    default String fullName(User user) {
        if (user == null) {
            return null;
        }
        String first = user.getFirstName() == null ? "" : user.getFirstName();
        String last = user.getLastName() == null ? "" : user.getLastName();
        String name = (first + " " + last).trim();
        return name.isEmpty() ? null : name;
    }
}
