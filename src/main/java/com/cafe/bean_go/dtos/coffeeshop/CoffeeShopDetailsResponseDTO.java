package com.cafe.bean_go.dtos.coffeeshop;


import com.cafe.bean_go.dtos.facility.FacilityResponseDTO;
import com.cafe.bean_go.dtos.menu.MenuItemResponseDTO;
import com.cafe.bean_go.dtos.schedule.OperatingHoursResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoffeeShopDetailsResponseDTO {

    private Long id;
    private String name;
    private String description;
    private String address;

    private Double latitude;
    private Double longitude;

    @Builder.Default
    private Set<FacilityResponseDTO> facilities = new HashSet<>();

    @Builder.Default
    private List<MenuItemResponseDTO> menu = new ArrayList<>();

    @Builder.Default
    private List<OperatingHoursResponseDTO> schedule = new ArrayList<>();
}
