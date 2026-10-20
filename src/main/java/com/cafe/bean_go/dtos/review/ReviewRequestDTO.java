package com.cafe.bean_go.dtos.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class ReviewRequestDTO {

    @NotNull(message = "The ID is mandatory")
    private Long coffeeShopId;

    @NotNull(message = "Giving a rating is mandatory")
    @Min(value = 1, message = "The minimum rating is 1")
    @Max(value = 5, message = "The maximum rating is 5")
    private Integer rating;

    @Size(max = 1000, message = "The comment can't be longer than 1000 characters")
    private String comment;
}
