package com.cafe.bean_go.exceptions;

import com.cafe.bean_go.dtos.errors.ApiErrorResponse;
import com.cafe.bean_go.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.MessageSourceResolvable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.security.access.AccessDeniedException;

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
            VoucherOwnershipException.class,
            CoffeeShopOwnershipException.class,
            AccessDeniedException.class
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

    @ExceptionHandler({
            VoucherExpiredException.class,
            InvalidScheduleException.class,
            HttpMessageNotReadableException.class,
            MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class
    })
    public ResponseEntity<ApiErrorResponse> handleBadRequestExceptions(Exception exception, HttpServletRequest httpServletRequest) {
        return buildErrorResponse(exception.getMessage(), HttpStatus.BAD_REQUEST, httpServletRequest);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiErrorResponse> handleAuthenticationException(AuthenticationException exception, HttpServletRequest httpServletRequest) {

        String message;
        Object jwtError = httpServletRequest.getAttribute(JwtAuthenticationFilter.JWT_ERROR_ATTRIBUTE);

        if (jwtError != null) {
            message = jwtError.toString();
        } else if (exception instanceof BadCredentialsException) {
            message = "Invalid email or password.";
        } else {
            message = "Authentication is required to access this resource.";
        }

        return buildErrorResponse(message, HttpStatus.UNAUTHORIZED, httpServletRequest);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException exception, HttpServletRequest httpServletRequest) {

        String errorMessage = exception.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        return buildErrorResponse(errorMessage, HttpStatus.BAD_REQUEST, httpServletRequest);
    }

    // Thrown when validation annotations sit directly on controller parameters,
    // e.g. List<@Valid OperatingHoursRequestDTO>.
    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ApiErrorResponse> handleMethodValidationExceptions(
            HandlerMethodValidationException exception, HttpServletRequest httpServletRequest) {

        String errorMessage = exception.getAllErrors().stream()
                .map(MessageSourceResolvable::getDefaultMessage)
                .collect(Collectors.joining(", "));

        return buildErrorResponse(errorMessage, HttpStatus.BAD_REQUEST, httpServletRequest);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrityViolationException(DataIntegrityViolationException exception, HttpServletRequest httpServletRequest) {
        return buildErrorResponse("Data integrity violation occurred.", HttpStatus.CONFLICT, httpServletRequest);
    }
}
