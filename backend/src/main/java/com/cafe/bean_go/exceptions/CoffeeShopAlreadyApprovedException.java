package com.cafe.bean_go.exceptions;

public class CoffeeShopAlreadyApprovedException extends RuntimeException {
    public CoffeeShopAlreadyApprovedException(String message) {
        super(message);
    }
}
