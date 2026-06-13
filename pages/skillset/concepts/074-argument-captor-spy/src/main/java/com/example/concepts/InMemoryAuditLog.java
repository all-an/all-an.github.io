package com.example.concepts;

import java.util.ArrayList;
import java.util.List;

// A REAL implementation with real behavior: it actually stores entries. A
// Mockito spy wraps an instance of this, so spied calls run this real code.
public class InMemoryAuditLog implements AuditLog {
  private final List<AuditEntry> entries = new ArrayList<>();

  @Override
  public void record(AuditEntry entry) {
    entries.add(entry);
  }

  public List<AuditEntry> entries() {
    return entries;
  }
}
