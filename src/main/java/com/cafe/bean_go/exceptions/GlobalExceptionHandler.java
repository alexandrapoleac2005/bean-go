package com.cafe.bean_go.exceptions;

import com.cafe.bean_go.dtos.errors.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private ResponseEntity<ApiErrorResponse> buildErrorResponse(String message, HttpStatus httpStatus, HttpServletRequest httpServletRequest){

        ApiErrorResponse apiErrorResponse = ApiErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(httpStatus.value())
                .error(httpStatus.getReasonPhrase())
                .message(message)
                .path(httpServletRequest.getRequestURI())
                .build();

        return ResponseEntity.status(httpStatus).body(apiErrorResponse);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleResourceNotFoundException(RuntimeException exception, HttpServletRequest httpServletRequest){
        return buildErrorResponse(exception.getMessage(), HttpStatus.NOT_FOUND, httpServletRequest);
    }

    @ExceptionHandler({
            FavoriteOwnershipException.class,
            ReviewOwnershipException.class,
            VoucherOwnershipException.class
    })
    public ResponseEntity<ApiErrorResponse> handleOwnershipExceptions(RuntimeException exception, HttpServletRequest httpServletRequest) {

        return buildErrorResponse(exception.getMessage(), HttpStatus.FORBIDDEN, httpServletRequest);
    }

    @ExceptionHandler({
            FavoriteAlreadyExistsException.class,
            ReviewAlreadyExistsException.class,
            VoucherAlreadyUsedException.class,
            EmailAlreadyExistsException.class
    })
    public ResponseEntity<ApiErrorResponse> handleConflictExceptions(RuntimeException exception, HttpServletRequest httpServletRequest){

        return buildErrorResponse(exception.getMessage(), HttpStatus.CONFLICT, httpServletRequest);
    }

    @ExceptionHandler(VoucherExpiredException.class)
    public ResponseEntity<ApiErrorResponse> handleBadRequestExceptions(RuntimeException exception, HttpServletRequest httpServletRequest) {
        return buildErrorResponse(exception.getMessage(), HttpStatus.BAD_REQUEST, httpServletRequest);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException exception, HttpServletRequest httpServletRequest) {

        String errorMessage = exception.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        return buildErrorResponse(errorMessage, HttpStatus.BAD_REQUEST, httpServletRequest);
    }

}
