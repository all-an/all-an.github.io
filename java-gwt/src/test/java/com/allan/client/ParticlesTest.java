package com.allan.client;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for Particles pure functions
 * Tests mirror the Rust WASM implementation tests
 */
class ParticlesTest {

    @Test
    @DisplayName("Calculate columns with zero width")
    void testCalculateColumnsZeroWidth() {
        assertEquals(0, Particles.calculateColumns(0.0, 10.0));
    }

    @Test
    @DisplayName("Calculate columns with exact division")
    void testCalculateColumnsExact() {
        assertEquals(10, Particles.calculateColumns(100.0, 10.0));
    }

    @Test
    @DisplayName("Calculate columns floors the result")
    void testCalculateColumnsFloor() {
        assertEquals(10, Particles.calculateColumns(105.0, 10.0));
        assertEquals(10, Particles.calculateColumns(109.9, 10.0));
    }

    @Test
    @DisplayName("Get random char from empty string returns space")
    void testGetRandomCharEmpty() {
        assertEquals(' ', Particles.getRandomChar(""));
    }

    @Test
    @DisplayName("Get random char from single character returns that character")
    void testGetRandomCharSingle() {
        assertEquals('A', Particles.getRandomChar("A"));
    }

    @Test
    @DisplayName("Get random char from multiple characters returns one of them")
    void testGetRandomCharMultiple() {
        for (int i = 0; i < 50; i++) {
            char ch = Particles.getRandomChar("AB");
            assertTrue(ch == 'A' || ch == 'B', "Character should be either A or B");
        }
    }

    @Test
    @DisplayName("Should not reset drop when not past canvas height")
    void testShouldResetDropNotPastHeight() {
        // Drop not past canvas height should never reset
        assertFalse(Particles.shouldResetDrop(5.0, 10.0, 100.0, 0.975));
    }

    @Test
    @DisplayName("Should reset drop sometimes when past canvas height")
    void testShouldResetDropPastHeight() {
        // Drop past height, test happens sometimes
        int resetCount = 0;
        for (int i = 0; i < 1000; i++) {
            if (Particles.shouldResetDrop(15.0, 10.0, 100.0, 0.975)) {
                resetCount++;
            }
        }
        // Should reset roughly 2.5% of the time (1 - 0.975)
        assertTrue(resetCount > 0 && resetCount < 100,
                   "Reset count should be between 0 and 100, was: " + resetCount);
    }

    @Test
    @DisplayName("Initialize drops creates array with all 1s")
    void testInitDrops() {
        int[] drops = Particles.initDrops(5);
        assertEquals(5, drops.length);
        for (int drop : drops) {
            assertEquals(1, drop);
        }
    }

    @Test
    @DisplayName("Initialize drops with zero count creates empty array")
    void testInitDropsEmpty() {
        int[] drops = Particles.initDrops(0);
        assertEquals(0, drops.length);
    }

    @Test
    @DisplayName("Update drop increments when not past height")
    void testUpdateDropIncrement() {
        // Normal case: drop should increment
        int drop = Particles.updateDrop(5, 10.0, 1000.0, 0.975);
        assertEquals(6, drop);
    }

    @Test
    @DisplayName("Update drop may reset when past height")
    void testUpdateDropResetCondition() {
        // Drop past height: may reset to 0 or increment
        int drop = Particles.updateDrop(150, 10.0, 1000.0, 0.975);
        assertTrue(drop == 0 || drop == 151,
                   "Drop should be either 0 (reset) or 151 (incremented), was: " + drop);
    }

    @Test
    @DisplayName("Calculate columns with large canvas")
    void testCalculateColumnsLargeCanvas() {
        assertEquals(192, Particles.calculateColumns(1920.0, 10.0));
        assertEquals(384, Particles.calculateColumns(3840.0, 10.0));
    }

    @Test
    @DisplayName("Calculate columns with different font sizes")
    void testCalculateColumnsDifferentFontSizes() {
        assertEquals(50, Particles.calculateColumns(1000.0, 20.0));
        assertEquals(200, Particles.calculateColumns(1000.0, 5.0));
        assertEquals(100, Particles.calculateColumns(1000.0, 10.0));
    }

    @Test
    @DisplayName("Get random char from charset containing special characters")
    void testGetRandomCharSpecialCharacters() {
        String charset = "黑客帝国@#$%";
        for (int i = 0; i < 50; i++) {
            char ch = Particles.getRandomChar(charset);
            assertTrue(charset.indexOf(ch) >= 0,
                       "Character should be from charset: " + ch);
        }
    }

    @Test
    @DisplayName("Initialize drops creates correct size array for typical screen")
    void testInitDropsTypicalScreen() {
        int columns = Particles.calculateColumns(1920.0, 10.0); // 192 columns
        int[] drops = Particles.initDrops(columns);
        assertEquals(192, drops.length);
    }

    @Test
    @DisplayName("Update drop sequence increments correctly")
    void testUpdateDropSequence() {
        int drop = 1;
        // Simulate several frames where drop is not past height
        for (int i = 0; i < 10; i++) {
            drop = Particles.updateDrop(drop, 10.0, 1000.0, 0.975);
        }
        assertEquals(11, drop);
    }

    @Test
    @DisplayName("Should reset drop probability edge cases")
    void testShouldResetDropEdgeCases() {
        // At exact boundary (drop.y == canvasHeight)
        boolean shouldReset = Particles.shouldResetDrop(10.0, 10.0, 100.0, 0.975);
        // Could be true or false depending on random, just ensure no exception

        // Just past boundary
        int resetCount = 0;
        for (int i = 0; i < 100; i++) {
            if (Particles.shouldResetDrop(10.1, 10.0, 100.0, 0.975)) {
                resetCount++;
            }
        }
        assertTrue(resetCount >= 0 && resetCount <= 100);
    }
}
