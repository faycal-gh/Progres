package com.progress.api.service;

import java.util.Optional;
import java.util.Set;
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
    /** Cache the set of card IDs a user is allowed to access */
    void storeAllowedCards(String uuid, Set<String> cardIds, long ttlMillis);
    /** Retrieve the cached set of allowed card IDs for a user */
    Optional<Set<String>> getAllowedCards(String uuid);
}
