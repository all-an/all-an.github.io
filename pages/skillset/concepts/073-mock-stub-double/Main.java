// Java
// Runnable version of the "Mock / stub / double" concept snippet.
//
// A test double replaces a real collaborator so a test runs fast and in
// isolation, without hitting a network, database, or payment API. Two kinds
// (Meszaros' taxonomy):
//   STUB — returns canned answers; the test checks the RESULT (state verification).
//   MOCK — also records how it was called; the test checks the INTERACTION
//          (behavior verification: was the collaborator used correctly?).
// This is hand-built with no framework (production Java uses Mockito), which
// makes the stub-vs-mock difference explicit.
//
// Quick start:  ./run.sh      (or: javac Main.java && java Main)

public class Main {
  // The real collaborator we do NOT want to call in a test — it would hit a live
  // payment API. The class under test depends on this interface, so a test can
  // hand it a double instead of the real implementation.
  interface PaymentGateway {
    boolean charge(String account, int cents);
  }

  // The class under test. The gateway is injected via the constructor, which is
  // what makes substituting a double possible.
  static final class OrderService {
    private final PaymentGateway gateway;

    OrderService(PaymentGateway gateway) {
      this.gateway = gateway;
    }

    // The logic we want to test, without ever contacting a real provider.
    String checkout(String account, int cents) {
      boolean approved = gateway.charge(account, cents);
      return approved ? "confirmed" : "declined";
    }
  }

  // A STUB: returns a canned answer with no logic, to drive the code under test
  // down a chosen path (here: payment approved).
  static final class ApprovingStub implements PaymentGateway {
    public boolean charge(String account, int cents) {
      return true; // canned response — always approves
    }
  }

  // A MOCK: like a stub, but it also RECORDS how it was called so the test can
  // verify the interaction afterwards, not just the returned result.
  static final class RecordingMock implements PaymentGateway {
    int callCount = 0;
    String lastAccount;
    int lastCents;

    public boolean charge(String account, int cents) {
      callCount++;
      lastAccount = account;
      lastCents = cents;
      return true;
    }
  }

  // Tiny assertion helper so the demo reads like a test report.
  static int failures = 0;

  static void check(String label, boolean condition) {
    System.out.println((condition ? "PASS" : "FAIL") + ": " + label);
    if (!condition) {
      failures++;
    }
  }

  public static void main(String[] args) {
    // Test 1 — STUB, state verification: the canned "approved" answer drives
    // checkout to "confirmed". We assert on the RESULT.
    OrderService withStub = new OrderService(new ApprovingStub());
    check("stub: approved payment -> confirmed",
        withStub.checkout("acc-1", 500).equals("confirmed"));

    // Test 2 — MOCK, behavior verification: we assert the gateway was charged
    // exactly once with the right account and amount — the INTERACTION, not the
    // result. This catches bugs a stub cannot, like charging twice or $0.
    RecordingMock mock = new RecordingMock();
    OrderService withMock = new OrderService(mock);
    withMock.checkout("acc-2", 1299);
    check("mock: charged exactly once", mock.callCount == 1);
    check("mock: charged the right account", mock.lastAccount.equals("acc-2"));
    check("mock: charged the right amount", mock.lastCents == 1299);

    // Test 3 — a STUB can be a one-liner: this lambda always declines, driving
    // the failure path without a real gateway for either outcome.
    PaymentGateway decliningStub = (account, cents) -> false;
    check("stub: declined payment -> declined",
        new OrderService(decliningStub).checkout("acc-3", 100).equals("declined"));

    System.out.println(failures == 0 ? "all checks passed" : failures + " check(s) failed");
  }
}
