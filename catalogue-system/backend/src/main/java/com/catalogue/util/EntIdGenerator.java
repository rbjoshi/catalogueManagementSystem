package com.catalogue.util;

import org.apache.commons.lang3.RandomStringUtils;

/**
 * Generates enterprise IDs following the pattern: "e-" + 32 random alphanumeric characters.
 * Example: e-aB3kL9mNqRsTuVwXyZ1234567890aB
 */
public class EntIdGenerator {

    private static final String PREFIX = "e-";
    private static final int RANDOM_PART_LENGTH = 32;

    private EntIdGenerator() {}

    /**
     * Generates a new unique enterprise ID.
     * Format: "e-" + 32 random alphanumeric characters (upper + lower + digits)
     */
    public static String generate() {
        String randomPart = RandomStringUtils.randomAlphanumeric(RANDOM_PART_LENGTH);
        return PREFIX + randomPart;
    }

    /**
     * Validates that an ID matches the ent_id pattern.
     */
    public static boolean isValid(String entId) {
        if (entId == null) return false;
        if (!entId.startsWith(PREFIX)) return false;
        String randomPart = entId.substring(PREFIX.length());
        return randomPart.length() == RANDOM_PART_LENGTH
                && randomPart.chars().allMatch(Character::isLetterOrDigit);
    }
}
