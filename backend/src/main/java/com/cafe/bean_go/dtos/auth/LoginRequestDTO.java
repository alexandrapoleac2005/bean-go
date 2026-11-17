package com.cafe.bean_go.dtos.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequestDTO {

    @Email(message = "The email format is not valid")
    @NotBlank(message = "The email is mandatory")
    private String email;

    @NotBlank(message = "The password is mandatory")
    private String password;
}
