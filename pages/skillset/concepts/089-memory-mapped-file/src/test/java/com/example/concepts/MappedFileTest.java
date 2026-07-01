package com.example.concepts;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;

// Verifies the mapped file: it behaves as random-access memory, its writes
// persist to disk across separate mappings, and two mappings of the same file
// share the same physical pages. Each test maps its own temporary file.
class MappedFileTest {

  // Best-effort cleanup. A memory-mapped file cannot be deleted on Windows until
  // the JVM unmaps it at GC (there is no explicit unmap), so a failure is ignored
  // and the OS reclaims the temp file later. On Unix the delete succeeds at once.
  private static void deleteQuietly(Path path) {
    try {
      Files.deleteIfExists(path);
    } catch (IOException ignored) {
      // still mapped on Windows — nothing useful to do here
    }
  }

  // The mapped region behaves as random-access memory: values written at byte
  // offsets come straight back, with no stream positioning involved.
  @Test
  void readsBackWhatItWroteInMemory() throws IOException {
    Path path = Files.createTempFile("mem", ".dat");
    try (MappedFile file = new MappedFile(path, 128)) {
      file.putInt(0, 7);
      file.putString(16, "mapped");

      assertEquals(7, file.getInt(0));
      assertEquals("mapped", file.getString(16));
    } finally {
      deleteQuietly(path);
    }
  }

  // Writes through the map are writes to the file: a fresh mapping opened after
  // flushing and closing sees the same bytes — the data persisted on disk.
  @Test
  void persistsAcrossRemappings() throws IOException {
    Path path = Files.createTempFile("persist", ".dat");
    try {
      try (MappedFile writer = new MappedFile(path, 128)) {
        writer.putString(0, "durable");
        writer.putInt(64, 99);
        writer.flush();
      }
      try (MappedFile reader = new MappedFile(path, 128)) {
        assertEquals("durable", reader.getString(0));
        assertEquals(99, reader.getInt(64));
      }
    } finally {
      deleteQuietly(path);
    }
  }

  // The defining property: two mappings of one file share the same physical
  // pages, so a write through one is visible through the other with no disk I/O
  // and no flush in between — this is what makes mmap a shared-memory mechanism.
  @Test
  void sharesMemoryBetweenTwoMappings() throws IOException {
    Path path = Files.createTempFile("shared", ".dat");
    try (MappedFile a = new MappedFile(path, 128);
         MappedFile b = new MappedFile(path, 128)) {
      a.putInt(0, 12345);
      assertEquals(12345, b.getInt(0));   // seen through the other mapping at once

      b.putInt(0, b.getInt(0) + 1);       // and the sharing works both ways
      assertEquals(12346, a.getInt(0));
    } finally {
      deleteQuietly(path);
    }
  }
}
