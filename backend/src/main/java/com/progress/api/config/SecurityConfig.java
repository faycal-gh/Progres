package com.progress.api.config;

import com.progress.api.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import jakarta.servlet.DispatcherType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthFilter;
        private final RateLimitFilter rateLimitFilter;

        @Value("${cors.allowed-origins}")
        private String allowedOrigins;

        @Value("${cors.allowed-methods}")
        private String allowedMethods;

        @Value("${cors.max-age}")
        private long maxAge;

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                return http
                                .csrf(AbstractHttpConfigurer::disable)
                                .httpBasic(AbstractHttpConfigurer::disable)
                                .formLogin(AbstractHttpConfigurer::disable)
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint(
                                                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                                .authorizeHttpRequests(auth -> auth
                                                .dispatcherTypeMatchers(DispatcherType.ASYNC, DispatcherType.ERROR).permitAll()
                                                .requestMatchers("/api/auth/**").permitAll()
                                                .requestMatchers("/actuator/**").permitAll()
                                                .requestMatchers(
                                                                "/swagger-ui/**",
                                                                "/swagger-ui.html",
                                                                "/swagger-resources/**",
                                                                "/v3/api-docs/**",
                                                                "/webjars/**",
                                                                "/error")
                                                .permitAll()
                                                .anyRequest().authenticated())
                                .addFilterAfter(rateLimitFilter, CorsFilter.class)
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                                .headers(headers -> headers
                                                .contentSecurityPolicy(csp -> csp.policyDirectives(
                                                                "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:"))
                                                .frameOptions(frame -> frame.deny())
                                                .xssProtection(xss -> xss.headerValue(
                                                                org.springframework.security.web.header.writers.XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK))
                                                .httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true)
                                                                .maxAgeInSeconds(31536000)))
                                .build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
                configuration.setAllowedMethods(Arrays.asList(allowedMethods.split(",")));
                configuration.setAllowedHeaders(List.of("*"));
                configuration.setAllowCredentials(true);
                configuration.setExposedHeaders(List.of("Set-Cookie"));
                configuration.setMaxAge(maxAge);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}
