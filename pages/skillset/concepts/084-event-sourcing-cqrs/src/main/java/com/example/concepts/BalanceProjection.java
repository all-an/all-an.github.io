package com.example.concepts;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

// A projection — the READ side of CQRS. It is a denormalised, query-optimised
// view (account id -> balance) built purely by folding the event log. It holds no
// authority: it can be thrown away and rebuilt from the events at any time, and
// several different read models can be derived from the same log. Separating this
// query view from the command/write Account is what CQRS means.
public class BalanceProjection {

  // The read model: current balance per account, in insertion order so queries
  // and tests are deterministic.
  private final Map<String, Integer> balanceByAccount = new LinkedHashMap<>();

  // Build the view by folding every event. Rebuilding from scratch is always
  // possible because the event log — not this view — is the source of truth.
  public static BalanceProjection from(List<AccountEvent> events) {
    BalanceProjection projection = new BalanceProjection();
    for (AccountEvent event : events) {
      projection.apply(event);
    }
    return projection;
  }

  // Update the view in response to one event.
  private void apply(AccountEvent event) {
    switch (event) {
      case AccountEvent.AccountOpened e  -> balanceByAccount.put(e.accountId(), 0);
      case AccountEvent.MoneyDeposited e -> balanceByAccount.merge(e.accountId(), e.amountCents(), Integer::sum);
      case AccountEvent.MoneyWithdrawn e -> balanceByAccount.merge(e.accountId(), -e.amountCents(), Integer::sum);
    }
  }

  // A QUERY: the current balance for one account, or 0 if it is unknown.
  public int balanceOf(String accountId) {
    return balanceByAccount.getOrDefault(accountId, 0);
  }

  // A QUERY: how many accounts the view knows about.
  public int accountCount() {
    return balanceByAccount.size();
  }
}
