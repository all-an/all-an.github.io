package com.example.concepts;

import java.util.ArrayList;
import java.util.List;

// The event store: a single, append-only, ordered log of everything that has
// happened. This is the source of truth in an event-sourced system — state is
// never overwritten or deleted, only new events are appended. Both the write
// side (rebuilding an aggregate) and the read side (building a projection) are
// derived from this one log.
public class EventStore {

  // The log, oldest event first. Append-only: we add, never mutate or remove.
  private final List<AccountEvent> log = new ArrayList<>();

  // Record a new event as the latest fact in the log.
  public void append(AccountEvent event) {
    log.add(event);
  }

  // Every event, oldest first — what a projection folds over to build a read
  // model. A copy is returned so callers cannot mutate the log.
  public List<AccountEvent> allEvents() {
    return new ArrayList<>(log);
  }

  // Just the events for one account, oldest first — the history an aggregate
  // replays to rebuild its current state.
  public List<AccountEvent> eventsFor(String accountId) {
    return log.stream()
        .filter(event -> event.accountId().equals(accountId))
        .toList();
  }
}
