package com.nilansh.urlshortener.service;

import java.math.BigInteger;

/**
 * Encodes bytes/numbers into a Base62 alphabet (0-9, a-z, A-Z).
 * Used to turn an MD5 digest into a short, URL-safe code.
 */
public final class Base62Encoder {

    private static final String ALPHABET =
            "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final BigInteger BASE = BigInteger.valueOf(62);

    private Base62Encoder() {
    }

    public static String encode(byte[] bytes) {
        // Treat the digest as an unsigned big integer, then repeatedly
        // divide by 62 to pull off Base62 digits.
        BigInteger value = new BigInteger(1, bytes);
        StringBuilder sb = new StringBuilder();

        if (value.equals(BigInteger.ZERO)) {
            return String.valueOf(ALPHABET.charAt(0));
        }

        while (value.compareTo(BigInteger.ZERO) > 0) {
            BigInteger[] divmod = value.divideAndRemainder(BASE);
            sb.append(ALPHABET.charAt(divmod[1].intValue()));
            value = divmod[0];
        }

        return sb.reverse().toString();
    }
}
