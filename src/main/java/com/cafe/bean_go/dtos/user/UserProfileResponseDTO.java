package com.cafe.bean_go.dtos.user;

import com.cafe.bean_go.entities.enums.UserBadge;
import lombok.*;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class UserProfileResponseDTO {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private Integer lifetimePoints;
    private UserBadge badge;
}
