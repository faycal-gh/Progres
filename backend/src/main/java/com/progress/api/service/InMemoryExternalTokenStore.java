package com.progress.api.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class InMemoryExternalTokenStore implements ExternalTokenStore {

    private record TokenEntry(String token, long expiresAt) {
        boolean isExpired() {
            return System.currentTimeMillis() > expiresAt;
        }
    }

    private final Map<String, TokenEntry> tokenStore = new ConcurrentHashMap<>();

    @Override
    public void store(String uuid, String externalToken, long ttlMillis) {
        if (uuid == null || uuid.isBlank()) {
            log.warn("Attempted to store token with null or blank UUID");
            return;
        }
        if (externalToken == null || externalToken.isBlank()) {
            log.warn("Attempted to store null or blank external token for UUID: {}", uuid);
            return;
        }

        long expiresAt = System.currentTimeMillis() + ttlMillis;
        tokenStore.put(uuid, new TokenEntry(externalToken, expiresAt));
        log.debug("Stored external token for UUID: {}, expires: {}", uuid, Instant.ofEpochMilli(expiresAt));
    }

    @Override
    public Optional<String> retrieve(String uuid) {
        if (uuid == null || uuid.isBlank()) {
            return Optional.empty();
        }

        TokenEntry entry = tokenStore.get(uuid);
        if (entry == null) {
            log.debug("No external token found for UUID: {}", uuid);
            return Optional.empty();
        }

        if (entry.isExpired()) {
            log.debug("External token expired for UUID: {}", uuid);
            tokenStore.remove(uuid);
            return Optional.empty();
        }

        return Optional.of(entry.token());
    }

    @Override
    public void remove(String uuid) {
        if (uuid == null || uuid.isBlank()) {
            return;
        }
        TokenEntry removed = tokenStore.remove(uuid);
        if (removed != null) {
            log.debug("Removed external token for UUID: {}", uuid);
        }
    }

    @Override
    public boolean exists(String uuid) {
        if (uuid == null || uuid.isBlank()) {
            return false;
        }
        TokenEntry entry = tokenStore.get(uuid);
        if (entry == null) {
            return false;
        }
        if (entry.isExpired()) {
            tokenStore.remove(uuid);
            return false;
        }
        return true;
    }

    @Override
    public void clear() {
        tokenStore.clear();
        log.info("Cleared all external tokens from store");
    }

    @Override
    public int size() {
        return tokenStore.size();
    }

    @Scheduled(fixedRate = 300000)
    public void cleanupExpiredTokens() {
        int beforeSize = tokenStore.size();

        tokenStore.entrySet().removeIf(entry -> entry.getValue().isExpired());

        int removed = beforeSize - tokenStore.size();
        if (removed > 0) {
            log.info("Cleaned up {} expired external tokens. Remaining: {}", removed, tokenStore.size());
        }
    }
}
