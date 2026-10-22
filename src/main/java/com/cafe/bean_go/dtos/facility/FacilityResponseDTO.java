package com.cafe.bean_go.dtos.facility;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacilityResponseDTO {
    private Long id;
    private String name;
    private String icon;
}
