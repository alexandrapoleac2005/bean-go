package com.cafe.bean_go.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${beango.security.jwt.secret-key}")
    private String secretKey;

    @Value("${beango.security.jwt.expiration}")
    private long jwtExpiration;

    // Decoded once at startup. Also makes the app fail fast if the secret is missing or too short.
    private Key signInKey;

    @PostConstruct
    void init() {
        this.signInKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey));
    }

    /**
     * Verifies the signature and expiration, then returns the claims.
     * Throws ExpiredJwtException / JwtException if the token is not valid.
     */
    public Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signInKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        return claimsResolver.apply(parseClaims(token));
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(signInKey, SignatureAlgorithm.HS256)
                .compact();
    }
}
