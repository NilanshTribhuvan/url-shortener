package com.nilansh.urlshortener;

import com.nilansh.urlshortener.service.Base62Encoder;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class Base62EncoderTest {

    @Test
    void encodesDeterministically() {
        byte[] input = {1, 2, 3, 4};
        String a = Base62Encoder.encode(input);
        String b = Base62Encoder.encode(input);
        assertEquals(a, b, "Same input should always produce the same encoding");
    }

    @Test
    void onlyUsesBase62Alphabet() {
        byte[] input = {(byte) 255, 0, 127, 64};
        String encoded = Base62Encoder.encode(input);
        assertTrue(encoded.matches("[0-9a-zA-Z]+"), "Output must be Base62 characters only");
    }

    @Test
    void differentInputsProduceDifferentOutputs() {
        String a = Base62Encoder.encode(new byte[]{1, 2, 3});
        String b = Base62Encoder.encode(new byte[]{3, 2, 1});
        assertNotEquals(a, b);
    }
}
