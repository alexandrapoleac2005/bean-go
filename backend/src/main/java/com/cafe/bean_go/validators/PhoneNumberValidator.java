package com.cafe.bean_go.validators;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

public class PhoneNumberValidator implements ConstraintValidator <ValidPhoneNumber, String>{

    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\+?[0-9. ()-]{7,15}$");

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context){
        if (value == null || value.isBlank()) return true;
        return PHONE_PATTERN.matcher(value).matches();
    }
}
