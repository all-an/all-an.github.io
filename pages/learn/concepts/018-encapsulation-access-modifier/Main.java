// Java
// Runnable version of the "Encapsulation / access modifier" concept snippet.
//
// Uses only the standard library — no external jars needed.
//
// Quick start:
//   ./run.sh
//
// Or manually:
//   javac Main.java
//   java  Main

// Encapsulation hides the internal state and exposes a small, validated API.
class BankAccount {
  // `private` means: only this class can read or write `balance`.
  // No external code can corrupt the invariant "balance >= 0".
  private double balance;

  BankAccount(double initial) {
    if (initial < 0) throw new IllegalArgumentException("initial balance must be non-negative");
    this.balance = initial;
  }

  // Public read accessor — callers can observe but cannot mutate directly.
  double getBalance() { return balance; }

  // Public mutator that enforces the invariant.
  void deposit(double amount) {
    if (amount <= 0) throw new IllegalArgumentException("deposit must be positive");
    balance += amount;
  }

  void withdraw(double amount) {
    if (amount <= 0) throw new IllegalArgumentException("withdrawal must be positive");
    if (amount > balance) throw new IllegalStateException("insufficient funds");
    balance -= amount;
  }
}

public class Main {
  public static void main(String[] args) {
    BankAccount account = new BankAccount(100);
    account.deposit(50);
    account.withdraw(30);
    System.out.println("balance: " + account.getBalance());

    // account.balance = -1_000_000;
    //   ^ would not compile — `balance` is private, so the invariant cannot be bypassed.

    // Validation kicks in on bad input:
    try {
      account.withdraw(9999);
    } catch (IllegalStateException e) {
      System.out.println("blocked: " + e.getMessage());
    }
  }
}
