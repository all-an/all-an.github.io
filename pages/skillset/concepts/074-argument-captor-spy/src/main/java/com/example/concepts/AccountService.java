package com.example.concepts;

// The class under test. On withdraw it builds an AuditEntry internally and sends
// it to the audit log — the entry the test will capture and inspect.
public class AccountService {
  private final AuditLog auditLog;

  public AccountService(AuditLog auditLog) {
    this.auditLog = auditLog;
  }

  // Withdraw records an audit trail. The AuditEntry is constructed here, not by
  // the caller, which is exactly why a test needs an ArgumentCaptor to see it.
  public void withdraw(String account, int amountCents) {
    auditLog.record(new AuditEntry(account, amountCents, "WITHDRAW"));
  }
}
