package com.progress.api.security;

import com.progress.api.service.ExternalTokenStore;
import com.progress.api.service.TokenBlacklist;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final TokenBlacklist tokenBlacklist;
    private final ExternalTokenStore externalTokenStore;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String uuid;

        log.info("JWT Filter: {} {} | Auth header: {}", 
                request.getMethod(), 
                request.getRequestURI(), 
                authHeader != null ? (authHeader.startsWith("Bearer ") ? "Bearer [present]" : authHeader) : "null");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);

        log.debug("Processing JWT for request: {} {}", request.getMethod(), request.getRequestURI());

        if (tokenBlacklist.isBlacklisted(jwt)) {
            log.debug("Rejected blacklisted token");
            filterChain.doFilter(request, response);
            return;
        }

        if (jwtTokenProvider.isTokenValid(jwt)) {
            uuid = jwtTokenProvider.extractUuid(jwt);
            log.debug("JWT valid for UUID: {}", uuid);
            
            // Retrieve external token from server-side storage
            Optional<String> externalTokenOpt = externalTokenStore.retrieve(uuid);
            
            if (externalTokenOpt.isEmpty()) {
                log.warn("No external token found for UUID: {}, session may have expired", uuid);
                filterChain.doFilter(request, response);
                return;
            }

            String externalToken = externalTokenOpt.get();
            log.debug("External token retrieved, setting security context");

            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    uuid,
                    externalToken,
                    Collections.emptyList());
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        } else {
            log.warn("JWT validation failed for token: {}...", jwt.substring(0, Math.min(20, jwt.length())));
        }

        filterChain.doFilter(request, response);
    }
}
