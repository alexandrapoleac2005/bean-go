package com.cafe.bean_go.services;

import com.cafe.bean_go.dtos.user.UserProfileResponseDTO;
import com.cafe.bean_go.entities.User;
import com.cafe.bean_go.entities.enums.UserBadge;
import com.cafe.bean_go.exceptions.ResourceNotFoundException;
import com.cafe.bean_go.mappers.UserMapper;
import com.cafe.bean_go.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserProfileResponseDTO getUserProfile(Long userId){
        User userFound = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User with ID: " + userId + " was not found."));
        return userMapper.toProfileDto(userFound);
    }

    @Transactional
    public void addLifetimePoints(Long userId, int pointsToAdd){
        User userFound = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User with ID: " + userId + " was not found"));
        userFound.setLifetimePoints(userFound.getLifetimePoints() + pointsToAdd);

        UserBadge newBadge = UserBadge.getBadgeForPoints(userFound.getLifetimePoints());

        if (userFound.getBadge() != newBadge) {
            userFound.setBadge(newBadge);
            // Optional pe viitor: Aici se poate apela un NotificationService ("Felicitări, ai atins nivelul COFFEE LOVER!")
        }

        userRepository.save(userFound);
    }
}
