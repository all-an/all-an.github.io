package com.example.concepts;

// Demonstrates event sourcing + CQRS on a tiny bank. The WRITE side turns
// commands into events appended to the log; the READ side builds a queryable
// projection from that same log. State is never stored — only events are, and
// everything else is derived from them.
public class Main {

  public static void main(String[] args) {
    EventStore store = new EventStore();

    // --- Write side: commands produce events that we append to the log. ---

    // Genesis command: open two accounts.
    store.append(Account.open("acc-1", "Alice"));
    store.append(Account.open("acc-2", "Bob"));

    // To run a command, REBUILD the aggregate from its history, then act on it
    // and append the resulting event.
    Account alice = Account.replay("acc-1", store.eventsFor("acc-1"));
    store.append(alice.deposit(10000));   // +$100.00
    store.append(alice.withdraw(3000));   //  -$30.00

    Account bob = Account.replay("acc-2", store.eventsFor("acc-2"));
    store.append(bob.deposit(5000));      // +$50.00

    System.out.println("Event log has " + store.allEvents().size() + " events.");

    // --- Read side (CQRS): build a projection from the same log and query it. ---
    BalanceProjection balances = BalanceProjection.from(store.allEvents());
    System.out.println("acc-1 balance: " + balances.balanceOf("acc-1") + " cents");
    System.out.println("acc-2 balance: " + balances.balanceOf("acc-2") + " cents");

    // The write side agrees: replaying acc-1's history yields the same balance,
    // because both sides are folds over the same events.
    Account rebuilt = Account.replay("acc-1", store.eventsFor("acc-1"));
    System.out.println("Rebuilt acc-1 from history: " + rebuilt.balanceCents() + " cents");

    // Another read model is just another fold over the same log — here, the total
    // ever deposited across all accounts.
    int totalDeposited = store.allEvents().stream()
        .filter(event -> event instanceof AccountEvent.MoneyDeposited)
        .mapToInt(event -> ((AccountEvent.MoneyDeposited) event).amountCents())
        .sum();
    System.out.println("Total deposited across all accounts: " + totalDeposited + " cents");
  }
}
