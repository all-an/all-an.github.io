package com.example.concepts;

// A value object built INSIDE the code under test and handed to the audit log.
// Because the test never constructs it, an ArgumentCaptor is how we inspect it.
public record AuditEntry(String account, int amountCents, String action) {}
