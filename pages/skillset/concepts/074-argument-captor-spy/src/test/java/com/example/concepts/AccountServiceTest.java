package com.example.concepts;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class AccountServiceTest {

  // ArgumentCaptor: grab the AuditEntry the service built internally, so we can
  // assert on its fields. A plain verify(eq(...)) cannot do this when the test
  // never constructs the object being passed.
  @Test
  void capturesTheAuditEntryArgument() {
    AuditLog auditLog = mock(AuditLog.class);
    AccountService service = new AccountService(auditLog);

    service.withdraw("acc-1", 2500);

    // Verify record() was called, capturing whatever entry it received.
    ArgumentCaptor<AuditEntry> captor = ArgumentCaptor.forClass(AuditEntry.class);
    verify(auditLog).record(captor.capture());

    // Now inspect the captured argument's fields.
    AuditEntry captured = captor.getValue();
    assertEquals("acc-1", captured.account());
    assertEquals(2500, captured.amountCents());
    assertEquals("WITHDRAW", captured.action());
  }

  // Spy: wrap a REAL InMemoryAuditLog. The real record() runs (the entry is truly
  // stored), AND Mockito records the call so verify + capture still work — that
  // is the difference between a spy (partial, real-by-default) and a mock.
  @Test
  void spyRunsRealCodeAndStillRecordsInteractions() {
    InMemoryAuditLog real = new InMemoryAuditLog();
    AuditLog spy = spy(real);
    AccountService service = new AccountService(spy);

    service.withdraw("acc-2", 99);

    // The real method actually ran: the entry is in the real backing list.
    assertEquals(1, real.entries().size());
    assertEquals("acc-2", real.entries().get(0).account());

    // And the interaction was still recorded, so verify + capture work on a spy.
    ArgumentCaptor<AuditEntry> captor = ArgumentCaptor.forClass(AuditEntry.class);
    verify(spy).record(captor.capture());
    assertEquals(99, captor.getValue().amountCents());
  }
}
