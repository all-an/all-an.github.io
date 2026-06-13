package com.example.concepts;

// The collaborator the service notifies. A spy can wrap a REAL implementation of
// this, so the real method runs while calls are still recorded for verification.
public interface AuditLog {
  void record(AuditEntry entry);
}
