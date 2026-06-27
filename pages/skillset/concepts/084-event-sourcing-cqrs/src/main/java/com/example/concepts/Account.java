package com.example.concepts;

import java.util.List;

// The aggregate — the WRITE side of CQRS. It holds no stored state of its own:
// its current balance is derived by replaying the account's events (the essence
// of event sourcing). Commands validate a request against that derived state and
// return the event to record; the event store, not this object, is permanent.
public final class Account {

  private final String accountId;

  // Derived state, rebuilt by replaying events. Never persisted directly.
  private boolean opened = false;
  private int balanceCents = 0;

  private Account(String accountId) {
    this.accountId = accountId;
  }

  // EVENT SOURCING: rebuild current state by replaying the account's history.
  // Nothing is loaded from a "current state" table — it is folded from events
  // every time, so the log alone is enough to reconstruct any aggregate.
  public static Account replay(String accountId, List<AccountEvent> history) {
    Account account = new Account(accountId);
    for (AccountEvent event : history) {
      account.apply(event);
    }
    return account;
  }

  // Fold a single event into state — a pure transition with NO validation. An
  // event is a fact that already happened, so it is always applied, never refused.
  private void apply(AccountEvent event) {
    switch (event) {
      case AccountEvent.AccountOpened ignored -> opened = true;
      case AccountEvent.MoneyDeposited e      -> balanceCents += e.amountCents();
      case AccountEvent.MoneyWithdrawn e      -> balanceCents -= e.amountCents();
    }
  }

  // COMMAND (genesis): opening an account has no prior aggregate to replay, so it
  // is a static factory that produces the very first event.
  public static AccountEvent open(String accountId, String owner) {
    return new AccountEvent.AccountOpened(accountId, owner);
  }

  // COMMAND: validate against current state, then return the event to record. A
  // command decides whether something MAY happen; the event records that it DID.
  // We also apply the event so this aggregate stays current for the next command.
  public AccountEvent deposit(int amountCents) {
    requireOpen();
    if (amountCents <= 0) {
      throw new IllegalArgumentException("deposit must be positive");
    }
    AccountEvent event = new AccountEvent.MoneyDeposited(accountId, amountCents);
    apply(event);
    return event;
  }

  // COMMAND: a withdrawal is refused if it would overdraw the account — the rule
  // that makes the command (write) side the guardian of invariants.
  public AccountEvent withdraw(int amountCents) {
    requireOpen();
    if (amountCents <= 0) {
      throw new IllegalArgumentException("withdrawal must be positive");
    }
    if (amountCents > balanceCents) {
      throw new IllegalStateException("insufficient funds");
    }
    AccountEvent event = new AccountEvent.MoneyWithdrawn(accountId, amountCents);
    apply(event);
    return event;
  }

  // The current balance derived from the replayed events, in cents.
  public int balanceCents() {
    return balanceCents;
  }

  // Guard: no command other than opening is valid until the account exists.
  private void requireOpen() {
    if (!opened) {
      throw new IllegalStateException("account is not open");
    }
  }
}
