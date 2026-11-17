package com.cafe.bean_go.exceptions;

public class VoucherAlreadyUsedException extends RuntimeException{
    public VoucherAlreadyUsedException(String message){
        super(message);
    }
}
