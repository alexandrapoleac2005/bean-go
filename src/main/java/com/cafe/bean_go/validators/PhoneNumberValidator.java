package com.cafe.bean_go.validators;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PhoneNumberValidator implements ConstraintValidator <ValidPhoneNumber, String>{

    private static final String PHONE_REGEX = "^\\+?[0-9. ()-]{7,15}$";

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context){
        if (value == null || value.trim().isEmpty()){
            return true;
        }
        return value.matches(PHONE_REGEX);
    }
}
