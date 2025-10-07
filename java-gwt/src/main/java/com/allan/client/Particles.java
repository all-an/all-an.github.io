package com.allan.client;

import com.google.gwt.core.client.EntryPoint;
import com.google.gwt.core.client.Scheduler;
import com.google.gwt.user.client.Window;
import com.google.gwt.dom.client.Document;
import com.google.gwt.dom.client.Element;
import com.google.gwt.canvas.client.Canvas;
import com.google.gwt.canvas.dom.client.Context2d;
import com.google.gwt.canvas.dom.client.CssColor;

import java.util.Random;

/**
 * Matrix-style falling character animation using GWT
 * Ported from Rust WASM implementation
 */
public class Particles implements EntryPoint {
    // Constants
    private static final String CHARSET = "黑客帝国abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()*&^%+-/~{[|`]}";
    private static final double FONT_SIZE = 10.0;
    private static final int DRAW_INTERVAL_MS = 35;
    private static final double TRAIL_ALPHA = 0.04;
    private static final String TEXT_COLOR = "#00FF46";
    private static final double RESET_PROBABILITY = 0.975;

    private static final Random random = new Random();

    // State
    private int[] drops;
    private Canvas canvas;
    private Context2d context;
    private double canvasWidth;
    private double canvasHeight;

    @Override
    public void onModuleLoad() {
        createParticles();
    }

    // ===== Pure Functions =====

    /**
     * Calculate number of columns based on canvas width
     */
    public static int calculateColumns(double canvasWidth, double fontSize) {
        return (int) Math.floor(canvasWidth / fontSize);
    }

    /**
     * Get random character from charset
     */
    public static char getRandomChar(String charset) {
        if (charset.isEmpty()) {
            return ' ';
        }
        int index = random.nextInt(charset.length());
        return charset.charAt(index);
    }

    /**
     * Check if drop should reset (based on position and probability)
     */
    public static boolean shouldResetDrop(double dropY, double fontSize, double canvasHeight, double resetProb) {
        return dropY * fontSize > canvasHeight && random.nextDouble() > resetProb;
    }

    /**
     * Initialize drops array with all 1s
     */
    public static int[] initDrops(int columnCount) {
        int[] drops = new int[columnCount];
        for (int i = 0; i < columnCount; i++) {
            drops[i] = 1;
        }
        return drops;
    }

    /**
     * Update a single drop position
     */
    public static int updateDrop(int drop, double fontSize, double canvasHeight, double resetProb) {
        if (shouldResetDrop(drop, fontSize, canvasHeight, resetProb)) {
            return 0;
        } else {
            return drop + 1;
        }
    }

    // ===== Impure Functions (DOM/Canvas) =====

    /**
     * Draw trail effect (semi-transparent black rectangle)
     * Package-private for testing
     */
    void drawTrail(Context2d ctx, double width, double height, double alpha) {
        ctx.setFillStyle(CssColor.make("rgba(0, 0, 0, " + alpha + ")"));
        ctx.fillRect(0, 0, width, height);
    }

    /**
     * Draw single character at position
     * Package-private for testing
     */
    void drawChar(Context2d ctx, char character, double x, double y,
                         double fontSize, String color) {
        ctx.setFillStyle(CssColor.make(color));
        ctx.setFont(fontSize + "px arial");
        ctx.fillText(String.valueOf(character), x, y);
    }

    /**
     * Main draw function - renders one frame
     */
    private void drawFrame() {
        // Draw trail
        drawTrail(context, canvasWidth, canvasHeight, TRAIL_ALPHA);

        // Draw and update each drop
        for (int i = 0; i < drops.length; i++) {
            // Get random character
            char character = getRandomChar(CHARSET);
            double x = i * FONT_SIZE;
            double y = drops[i] * FONT_SIZE;

            // Draw character
            drawChar(context, character, x, y, FONT_SIZE, TEXT_COLOR);

            // Update drop position
            drops[i] = updateDrop(drops[i], FONT_SIZE, canvasHeight, RESET_PROBABILITY);
        }
    }

    // ===== GWT Entry Point =====

    /**
     * Create and start the particle animation
     */
    public void createParticles() {
        // Create canvas element
        canvas = Canvas.createIfSupported();
        if (canvas == null) {
            Window.alert("Your browser does not support HTML5 Canvas!");
            return;
        }

        canvas.getElement().setId("c");

        // Set canvas to full window size
        int width = Window.getClientWidth();
        int height = Window.getClientHeight();
        canvas.setWidth(width + "px");
        canvas.setHeight(height + "px");
        canvas.setCoordinateSpaceWidth(width);
        canvas.setCoordinateSpaceHeight(height);

        // Append to body
        Document.get().getBody().appendChild(canvas.getElement());

        // Get 2D context
        context = canvas.getContext2d();

        // Initialize drops
        canvasWidth = width;
        canvasHeight = height;
        int columns = calculateColumns(canvasWidth, FONT_SIZE);
        drops = initDrops(columns);

        // Setup animation loop using Scheduler
        Scheduler.get().scheduleFixedDelay(new Scheduler.RepeatingCommand() {
            @Override
            public boolean execute() {
                drawFrame();
                return true; // Keep repeating
            }
        }, DRAW_INTERVAL_MS);
    }
}
