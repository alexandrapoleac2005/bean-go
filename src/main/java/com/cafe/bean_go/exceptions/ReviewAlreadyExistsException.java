package com.cafe.bean_go.exceptions;

public class ReviewAlreadyExistsException extends RuntimeException{
    public ReviewAlreadyExistsException(String message){
        super(message);
    }
}
