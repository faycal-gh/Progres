package com.progress.api.service;

import java.util.Optional;
/* 
 Interface for securely storing external API tokens server-side
*/
public interface ExternalTokenStore {
    void store(String uuid, String externalToken, long ttlMillis);
    Optional<String> retrieve(String uuid);
    void remove(String uuid);
    boolean exists(String uuid);
    void clear();
    int size();
}
