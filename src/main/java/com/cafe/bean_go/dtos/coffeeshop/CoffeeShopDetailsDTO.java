package com.cafe.bean_go.dtos.coffeeshop;


import com.cafe.bean_go.dtos.facility.FacilityDTO;
import com.cafe.bean_go.dtos.menu.MenuItemDTO;
import com.cafe.bean_go.dtos.schedule.OperatingHoursDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoffeeShopDetailsDTO {

    private Long id;
    private String name;
    private String description;
    private String address;
    private Boolean isApproved;

    private Double latitude;
    private Double longitude;

    private Set<FacilityDTO> facilities;
    private List<MenuItemDTO> menu;
    private List<OperatingHoursDTO> schedule;
}
