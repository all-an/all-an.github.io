package com.example.concepts;

// The events: immutable FACTS about things that have already happened to an
// account. In event sourcing these are the source of truth — the system stores
// the events, not the current state, and derives state by replaying them.
//
// A sealed interface lists every kind of event up front, so a switch over them
// is exhaustive and the compiler flags any new event type that is not handled.
public sealed interface AccountEvent
    permits AccountEvent.AccountOpened,
            AccountEvent.MoneyDeposited,
            AccountEvent.MoneyWithdrawn {

  // Every event concerns exactly one account. Exposing the id here lets the store
  // and projections group events by the account they belong to.
  String accountId();

  // The account came into existence, owned by someone.
  record AccountOpened(String accountId, String owner) implements AccountEvent {}

  // Money was added to the account, in cents.
  record MoneyDeposited(String accountId, int amountCents) implements AccountEvent {}

  // Money was taken out of the account, in cents.
  record MoneyWithdrawn(String accountId, int amountCents) implements AccountEvent {}
}
