package com.cafe.bean_go.validators;

import jakarta.validation.Payload;

public @interface ValidPhoneNumber {
    String message() default "Invalid phone number format";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
