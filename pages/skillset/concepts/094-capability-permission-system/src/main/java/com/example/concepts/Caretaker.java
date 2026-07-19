package com.example.concepts;

import java.util.Set;

// Revocation, via the caretaker pattern (Redell, 1974). A capability handed away is
// gone — you cannot reach into another component and take a reference back. So to
// keep the ability to withdraw authority, you never hand out the real capability at
// all: you hand out a *forwarder* that you can switch off.
//
// The essential move is that this splits one capability into two, and they go to
// different places: the grantee gets `access()` and can use the resource; the
// grantor keeps the Caretaker itself and can `revoke()`. Because the grantee was
// never given the Caretaker, it cannot un-revoke itself — and because the forwarder
// holds the real capability privately, revoking truly cuts the connection rather
// than merely asking the grantee to stop.
public final class Caretaker {

  // The real capability, held privately and dropped on revocation. Nulling it is
  // what makes revocation real: after this, no path from the forwarder reaches the
  // resource, whatever the grantee still has a reference to.
  private ReadAccess target;

  // The switched-off forwarder handed to the grantee — created once, so the grantee
  // holds the same object before and after revocation. Its authority changes
  // underneath it; the reference does not.
  private final ReadAccess forwarder = new Forwarder();

  private Caretaker(ReadAccess target) {
    this.target = target;
  }

  // Wrap a capability so it can later be withdrawn. Keep the returned Caretaker;
  // give away only its access().
  public static Caretaker forwarding(ReadAccess target) {
    return new Caretaker(target);
  }

  // The revocable capability to hand to the grantee. This is what they hold, and
  // all they hold — it exposes no way back to the Caretaker that controls it.
  public ReadAccess access() {
    return forwarder;
  }

  // Withdraw the authority. Every later call through the forwarder fails, including
  // calls made from code that captured the reference long ago.
  public void revoke() {
    target = null;
  }

  public boolean isRevoked() {
    return target == null;
  }

  // Passes calls through to the real capability while one is still attached. An
  // inner (non-static) class so it can see the mutable `target` field — that shared
  // view is exactly how revocation reaches a reference already given away.
  private final class Forwarder implements ReadAccess {

    @Override
    public String read(String path) {
      return live().read(path);
    }

    @Override
    public Set<String> list() {
      return live().list();
    }

    // The forwarder holds no authority of its own; once the target is gone there is
    // nothing left to forward to.
    private ReadAccess live() {
      if (target == null) {
        throw new SecurityException("this capability has been revoked");
      }
      return target;
    }
  }
}
