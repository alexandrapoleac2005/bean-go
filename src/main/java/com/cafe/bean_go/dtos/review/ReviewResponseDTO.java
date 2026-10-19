package com.cafe.bean_go.dtos.review;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReviewResponseDTO {

    private Long id;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;

    private String userFirstName;
    private String userLastName;

    private String coffeeShopName;
}
