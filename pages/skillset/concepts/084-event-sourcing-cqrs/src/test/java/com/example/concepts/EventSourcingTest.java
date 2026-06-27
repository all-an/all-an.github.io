package com.example.concepts;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import org.junit.jupiter.api.Test;

// Verifies the two ideas together: event sourcing (state is a fold over events)
// and CQRS (a separate read-side projection answers queries from the same log).
class EventSourcingTest {

  // EVENT SOURCING: an aggregate's state is purely a replay of its event history.
  @Test
  void replayRebuildsStateFromEventHistory() {
    List<AccountEvent> history = List.of(
        new AccountEvent.AccountOpened("acc-1", "Alice"),
        new AccountEvent.MoneyDeposited("acc-1", 10000),
        new AccountEvent.MoneyWithdrawn("acc-1", 3000)
    );

    Account account = Account.replay("acc-1", history);

    assertEquals(7000, account.balanceCents());   // 10000 - 3000
  }

  // A command VALIDATES before producing an event: overdrawing is refused.
  @Test
  void withdrawingMoreThanTheBalanceIsRejected() {
    Account account = Account.replay("acc-1", List.of(
        new AccountEvent.AccountOpened("acc-1", "Alice"),
        new AccountEvent.MoneyDeposited("acc-1", 5000)
    ));

    assertThrows(IllegalStateException.class, () -> account.withdraw(9000));
  }

  // No command other than opening is valid until the account's opening event
  // has been replayed.
  @Test
  void commandsAreRejectedBeforeTheAccountIsOpened() {
    Account account = Account.replay("acc-1", List.of());   // no history yet

    assertThrows(IllegalStateException.class, () -> account.deposit(1000));
  }

  // A deposit must be a positive amount.
  @Test
  void depositMustBePositive() {
    Account account = Account.replay("acc-1", List.of(
        new AccountEvent.AccountOpened("acc-1", "Alice")
    ));

    assertThrows(IllegalArgumentException.class, () -> account.deposit(0));
  }

  // CQRS read side: a projection folds the log into a queryable balance view.
  @Test
  void projectionAnswersBalanceQueriesFromTheLog() {
    EventStore store = new EventStore();
    store.append(Account.open("acc-1", "Alice"));
    Account alice = Account.replay("acc-1", store.eventsFor("acc-1"));
    store.append(alice.deposit(8000));
    store.append(alice.withdraw(2000));

    BalanceProjection balances = BalanceProjection.from(store.allEvents());

    assertEquals(6000, balances.balanceOf("acc-1"));   // 8000 - 2000
    assertEquals(1, balances.accountCount());
  }

  // The store keeps each account's events separate, oldest first.
  @Test
  void storeReturnsOnlyTheRequestedAccountsEventsInOrder() {
    EventStore store = new EventStore();
    store.append(Account.open("acc-1", "Alice"));
    store.append(Account.open("acc-2", "Bob"));
    Account alice = Account.replay("acc-1", store.eventsFor("acc-1"));
    store.append(alice.deposit(1000));

    List<AccountEvent> aliceEvents = store.eventsFor("acc-1");
    assertEquals(2, aliceEvents.size());                // open + deposit, not Bob's
    assertEquals("acc-1", aliceEvents.get(0).accountId());
    assertTrue(aliceEvents.get(1) instanceof AccountEvent.MoneyDeposited);
  }
}
