package com.cafe.bean_go.mappers;

import com.cafe.bean_go.dtos.voucher.VoucherResponseDTO;
import com.cafe.bean_go.entities.Voucher;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface VoucherMapper {

    @Mapping(source = "coffeeShop.name", target = "coffeeShopName")
    VoucherResponseDTO toResponseDto(Voucher voucher);
}