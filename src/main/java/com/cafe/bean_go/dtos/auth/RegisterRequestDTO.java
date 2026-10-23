package com.cafe.bean_go.dtos.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequestDTO {

    @NotBlank(message = "The first name is mandatory")
    private String firstName;

    @NotBlank(message = "The last name is mandatory")
    private String lastName;

    @Email(message = "The email format is not valid")
    @NotBlank(message = "The email is mandatory")
    private String email;

    @NotBlank(message = "The password is mandatory")
    @Size(min = 6, message = "The password must be at least 6 characters")
    private String password;
}
