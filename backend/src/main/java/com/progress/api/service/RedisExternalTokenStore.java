package com.progress.api.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "external-token-store.type", havingValue = "redis")
public class RedisExternalTokenStore implements ExternalTokenStore {

    private static final String TOKEN_KEY_PREFIX = "ext:token:";
    private static final String CARDS_KEY_PREFIX = "ext:cards:";

    private final StringRedisTemplate redisTemplate;

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

        String key = tokenKey(uuid);
        try {
            redisTemplate.opsForValue().set(key, externalToken, Duration.ofMillis(ttlMillis));
            log.debug("Stored external token for UUID: {}", uuid);
        } catch (Exception e) {
            log.error("Redis store failed for UUID {}: {}", uuid, e.getMessage());
        }
    }

    @Override
    public Optional<String> retrieve(String uuid) {
        if (uuid == null || uuid.isBlank()) {
            return Optional.empty();
        }
        try {
            String value = redisTemplate.opsForValue().get(tokenKey(uuid));
            return Optional.ofNullable(value);
        } catch (Exception e) {
            log.error("Redis retrieve failed for UUID {}: {}", uuid, e.getMessage());
            return Optional.empty();
        }
    }

    @Override
    public void remove(String uuid) {
        if (uuid == null || uuid.isBlank()) {
            return;
        }
        redisTemplate.delete(tokenKey(uuid));
        redisTemplate.delete(cardsKey(uuid));
    }

    @Override
    public boolean exists(String uuid) {
        if (uuid == null || uuid.isBlank()) {
            return false;
        }
        Boolean hasKey = redisTemplate.hasKey(tokenKey(uuid));
        return Boolean.TRUE.equals(hasKey);
    }

    @Override
    public void clear() {
        log.warn("Clear not supported for RedisExternalTokenStore; skipping");
    }

    @Override
    public int size() {
        log.warn("Size not supported for RedisExternalTokenStore; returning 0");
        return 0;
    }

    @Override
    public void storeAllowedCards(String uuid, Set<String> cardIds, long ttlMillis) {
        if (uuid == null || uuid.isBlank() || cardIds == null || cardIds.isEmpty()) {
            return;
        }
        String key = cardsKey(uuid);
        redisTemplate.opsForSet().add(key, cardIds.toArray(new String[0]));
        redisTemplate.expire(key, Duration.ofMillis(ttlMillis));
        log.debug("Cached {} allowed cards for UUID: {}", cardIds.size(), uuid);
    }

    @Override
    public Optional<Set<String>> getAllowedCards(String uuid) {
        if (uuid == null || uuid.isBlank()) {
            return Optional.empty();
        }
        String key = cardsKey(uuid);
        Set<String> members = redisTemplate.opsForSet().members(key);
        if (members == null || members.isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(members);
    }

    private String tokenKey(String uuid) {
        return TOKEN_KEY_PREFIX + uuid;
    }

    private String cardsKey(String uuid) {
        return CARDS_KEY_PREFIX + uuid;
    }
}
