package com.cafe.bean_go.exceptions;

public class VoucherExpiredException extends RuntimeException{
    public VoucherExpiredException(String message){
        super(message);
    }
}
