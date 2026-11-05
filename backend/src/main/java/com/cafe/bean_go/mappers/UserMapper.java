package com.cafe.bean_go.mappers;

import com.cafe.bean_go.dtos.user.UserProfileResponseDTO;
import com.cafe.bean_go.entities.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserProfileResponseDTO toProfileDto(User user);
}
