package com.example.concepts;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

// Demonstrates a memory-mapped file: the file's bytes are read and written as if
// they were an in-memory array, the changes persist as the file itself, and a
// second mapping of the same file shares the very same physical memory.
public class Main {

  public static void main(String[] args) throws IOException {
    Path path = Files.createTempFile("mapped", ".dat");

    // Byte layout inside the mapped region: a greeting near the start, a counter
    // further along. With a mapping these are just offsets into memory.
    int greetingOffset = 0;
    int counterOffset = 64;

    // Write through one mapping as plain memory writes, then flush to disk.
    try (MappedFile writer = new MappedFile(path, 128)) {
      writer.putString(greetingOffset, "hello, mmap");
      writer.putInt(counterOffset, 41);
      writer.flush();
    }

    // A brand-new mapping of the same file sees the persisted bytes — the writes
    // above went to the file itself, not to a transient stream buffer.
    try (MappedFile reader = new MappedFile(path, 128)) {
      System.out.println("Greeting read back: " + reader.getString(greetingOffset));
      System.out.println("Counter read back: " + reader.getInt(counterOffset));
    }

    // Two live mappings of the same file share physical pages: a write through one
    // is visible through the other with no read from disk, and no flush, between.
    try (MappedFile a = new MappedFile(path, 128);
         MappedFile b = new MappedFile(path, 128)) {
      a.putInt(counterOffset, a.getInt(counterOffset) + 1);   // 41 → 42 via mapping A
      System.out.println("Counter seen via other mapping: " + b.getInt(counterOffset));
    }

    // Best-effort cleanup. A memory-mapped file cannot be deleted on Windows
    // until the JVM unmaps it at GC, so a failure here is ignored — the OS
    // reclaims the temp file later. On Unix the delete succeeds immediately.
    try {
      Files.deleteIfExists(path);
    } catch (IOException ignored) {
      // still mapped on Windows; nothing useful to do at shutdown
    }
  }
}
