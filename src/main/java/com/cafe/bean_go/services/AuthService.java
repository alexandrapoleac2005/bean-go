package com.cafe.bean_go.services;

import com.cafe.bean_go.dtos.auth.AuthResponseDTO;
import com.cafe.bean_go.dtos.auth.LoginRequestDTO;
import com.cafe.bean_go.dtos.auth.RegisterRequestDTO;
import com.cafe.bean_go.entities.User;
import com.cafe.bean_go.entities.enums.Role;
import com.cafe.bean_go.entities.enums.UserBadge;
import com.cafe.bean_go.exceptions.EmailAlreadyExistsException;
import com.cafe.bean_go.repositories.UserRepository;
import com.cafe.bean_go.security.CustomUserDetails;
import com.cafe.bean_go.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponseDTO register(RegisterRequestDTO request) {
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .lifetimePoints(0)
                .badge(UserBadge.ROOKIE)
                .build();

        if(userRepository.existsByEmail(request.getEmail())){
            throw new EmailAlreadyExistsException("The email is already used");
        }

        userRepository.save(user);

        String jwtToken = jwtService.generateToken(new CustomUserDetails(user));
        return AuthResponseDTO.builder().token(jwtToken).build();
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        String jwtToken = jwtService.generateToken(new CustomUserDetails(user));

        return AuthResponseDTO.builder().token(jwtToken).build();
    }
}