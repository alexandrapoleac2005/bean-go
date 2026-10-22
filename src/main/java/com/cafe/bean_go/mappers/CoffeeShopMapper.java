package com.cafe.bean_go.mappers;

import com.cafe.bean_go.dtos.coffeeshop.CoffeeShopRequestDTO;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
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
import org.locationtech.jts.geom.PrecisionModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface CoffeeShopMapper {

    @Mapping(target = "location", expression = "java(toPoint(requestDTO.getLat(), requestDTO.getLng()))")
    @Mapping(target = "isApproved", constant = "false")
    CoffeeShop toEntity(CoffeeShopRequestDTO requestDTO);

    @Mapping(source = "location", target = "latitude", qualifiedByName = "getLatitude")
    @Mapping(source = "location", target = "longitude", qualifiedByName = "getLongitude")
    CoffeeShopSummaryResponseDTO toSummaryDto(CoffeeShop coffeeShop);

    @Mapping(source = "location", target = "latitude", qualifiedByName = "getLatitude")
    @Mapping(source = "location", target = "longitude", qualifiedByName = "getLongitude")
    @Mapping(source = "menuItems", target = "menu")
    @Mapping(source = "operatingHours", target = "schedule")
    CoffeeShopDetailsResponseDTO toDetailsDto(CoffeeShop coffeeShop);

    FacilityResponseDTO toFacilityDto(Facility facility);

    MenuItemResponseDTO toMenuItemDto(MenuItem menuItem);

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

    @Named("toPoint")
    default Point toPoint(Double lat, Double lng) {

        if (lat == null || lng == null) {
            return null;
        }

        GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

        return geometryFactory.createPoint(new Coordinate(lng, lat));
    }
}
