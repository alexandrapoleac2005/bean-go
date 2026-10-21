package com.cafe.bean_go.exceptions;

import com.cafe.bean_go.repositories.FavoriteRepository;

public class FavoriteAlreadyExistsException extends RuntimeException{
    public FavoriteAlreadyExistsException (String message){
        super(message);
    }
}
