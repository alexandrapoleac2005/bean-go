package com.cafe.bean_go.dtos.schedule;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OperatingHoursDTO {
    private String dayOfWeek;
    private LocalTime openTime;
    private LocalTime closeTime;
}
