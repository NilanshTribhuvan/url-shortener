package com.nilansh.urlshortener.service;

import java.math.BigInteger;

public final class Base62Encoder {

    private static final String ALPHABET =
            "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final BigInteger BASE = BigInteger.valueOf(62);

    private Base62Encoder() {
    }

    public static String encode(byte[] bytes) {

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
