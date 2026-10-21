package com.cafe.bean_go.mappers;

import com.cafe.bean_go.dtos.coffeeshop.CoffeeShopDetailsDTO;
import com.cafe.bean_go.dtos.coffeeshop.CoffeeShopSummaryDTO;
import com.cafe.bean_go.dtos.facility.FacilityDTO;
import com.cafe.bean_go.dtos.menu.MenuItemDTO;
import com.cafe.bean_go.dtos.schedule.OperatingHoursDTO;
import com.cafe.bean_go.entities.CoffeeShop;
import com.cafe.bean_go.entities.Facility;
import com.cafe.bean_go.entities.MenuItem;
import com.cafe.bean_go.entities.OperatingHours;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.awt.*;

@Mapper(componentModel = "spring")
public interface CoffeeShopMapper {
    @Mapping(source="location",target="latitude",qualifiedByName ="getLatitude")
    @Mapping(source="location", target = "longitude", qualifiedByName = "getLongitude")
    CoffeeShopSummaryDTO toSummaryDto(CoffeeShop coffeeShop);

    @Mapping(source = "location", target = "latitude", qualifiedByName = "getLatitude")
    @Mapping(source = "location", target = "longitude", qualifiedByName = "getLongitude")
    CoffeeShopDetailsDTO toDetailsDto(CoffeeShop coffeeShop);

    FacilityDTO toFacilityDto(Facility facility);
    MenuItemDTO toMenuItemDto(MenuItem menuItem);
    OperatingHoursDTO toOperatingHoursDto(OperatingHours operatingHours);

    @Named("getLatitude")
    default Double getLatitude(Point location)
    {
        if(location==null)
            return null;
        return location.getY();
    }

    @Named("getLongitude")
    default Double getLongitude(Point location)
    {
        if(location==null)
            return null;
        return location.getX();
    }
}
