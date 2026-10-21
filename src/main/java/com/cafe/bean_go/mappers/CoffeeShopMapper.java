package com.cafe.bean_go.mappers;

import org.locationtech.jts.geom.Point;
import com.cafe.bean_go.dtos.coffeeshop.CoffeeShopDetailsResponseDTO;
import com.cafe.bean_go.dtos.coffeeshop.CoffeeShopSummaryResponseDTO;
import com.cafe.bean_go.dtos.facility.FacilityResponseDTO;
import com.cafe.bean_go.dtos.menu.MenuItemResponseDTO;
import com.cafe.bean_go.dtos.menu.MenuItemRequestDTO;
import com.cafe.bean_go.dtos.schedule.OperatingHoursResponseDTO;
import com.cafe.bean_go.entities.CoffeeShop;
import com.cafe.bean_go.entities.Facility;
import com.cafe.bean_go.entities.MenuItem;
import com.cafe.bean_go.entities.OperatingHours;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface CoffeeShopMapper {
    @Mapping(source = "location", target = "latitude", qualifiedByName = "getLatitude")
    @Mapping(source = "location", target = "longitude", qualifiedByName = "getLongitude")
    CoffeeShopSummaryResponseDTO toSummaryDto(CoffeeShop coffeeShop);

    @Mapping(source = "location", target = "latitude", qualifiedByName = "getLatitude")
    @Mapping(source = "location", target = "longitude", qualifiedByName = "getLongitude")
    @Mapping(source = "menuItems", target = "menu")
    CoffeeShopDetailsResponseDTO toDetailsDto(CoffeeShop coffeeShop);

    FacilityResponseDTO toFacilityDto(Facility facility);

    MenuItemResponseDTO toMenuItemDto(MenuItem menuItem);

    @Mapping(source = "operatingHours", target = "schedule")
    OperatingHoursResponseDTO toOperatingHoursDto(OperatingHours operatingHours);

    @Named("getLatitude")
    default Double getLatitude(Point location) {
        if (location == null)
            return null;
        return location.getY();
    }

    @Named("getLongitude")
    default Double getLongitude(Point location) {
        if (location == null)
            return null;
        return location.getX();
    }

    MenuItem toMenuItemEntity(MenuItemRequestDTO menuItemRequestDTO);
}
