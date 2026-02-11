package com.progress.api.service;

public interface TokenBlacklist {

    void blacklist(String token, long expirationTimeMs);
    boolean isBlacklisted(String token);
    void remove(String token);
    int size();
    void clear();
}
