package com.progress.api.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class TokenBlacklistService implements TokenBlacklist {

    private final Map<String, Long> blacklistedTokens = new ConcurrentHashMap<>();

    @Override
    public void blacklist(String token, long expirationTimeMs) {
        if (token == null || token.isBlank()) {
            log.warn("Attempted to blacklist null or blank token");
            return;
        }
        blacklistedTokens.put(token, expirationTimeMs);
        log.debug("Token blacklisted, expiration: {}", Instant.ofEpochMilli(expirationTimeMs));
    }

    @Override
    public boolean isBlacklisted(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        return blacklistedTokens.containsKey(token);
    }

    @Override
    public void remove(String token) {
        blacklistedTokens.remove(token);
    }

    @Override
    public int size() {
        return blacklistedTokens.size();
    }

    @Override
    public void clear() {
        blacklistedTokens.clear();
    }

    @Scheduled(fixedRate = 300000)
    public void cleanupExpiredTokens() {
        long now = System.currentTimeMillis();
        int beforeSize = blacklistedTokens.size();

        blacklistedTokens.entrySet().removeIf(entry -> entry.getValue() < now);

        int removed = beforeSize - blacklistedTokens.size();
        if (removed > 0) {
            log.info("Cleaned up {} expired tokens from blacklist. Remaining: {}",
                    removed, blacklistedTokens.size());
        }
    }
}
