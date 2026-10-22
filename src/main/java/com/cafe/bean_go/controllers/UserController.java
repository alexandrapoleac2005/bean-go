package com.cafe.bean_go.controllers;

import com.cafe.bean_go.dtos.user.UserProfileResponseDTO;
import com.cafe.bean_go.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{userId}/profile")
    public ResponseEntity<UserProfileResponseDTO> getUserProfile(@PathVariable Long userId){
        UserProfileResponseDTO profileResponseDTO = userService.getUserProfile(userId);
        return ResponseEntity.ok(profileResponseDTO);
    }

}
