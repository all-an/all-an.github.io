package com.example.concepts;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

// Verifies the defining properties of the object-capability model: authority comes
// from holding an unforgeable reference rather than from an identity that gets
// checked, capabilities can be narrowed but never widened, they can be delegated,
// and a delegation can be revoked after the fact.
class CapabilityTest {

  private FileAccess root;

  @BeforeEach
  void createStore() {
    root = FileStore.createWithRootAccess();
    root.write("/home/notes.txt", "buy milk");
    root.write("/home/todo.txt", "write concept 094");
    root.write("/etc/secrets.txt", "hunter2");
  }

  // The root capability is the source of all authority over the store, handed out
  // once when the store is created. There is no other way in — no static accessor,
  // no registry, no way to reach a FileStore at all.
  @Test
  void rootCapabilityHasFullAuthority() {
    assertEquals("hunter2", root.read("/etc/secrets.txt"));
    assertEquals(Set.of("/home/notes.txt", "/home/todo.txt", "/etc/secrets.txt"), root.list());
  }

  // Attenuation narrows authority: the scoped capability can still read and write,
  // but only inside its subtree. Nothing about the caller is consulted — the same
  // code gets a different answer purely because it used a different capability.
  @Test
  void attenuationNarrowsWhatACapabilityCanReach() {
    FileAccess home = Attenuation.scopedTo(root, "/home/");

    assertEquals("buy milk", home.read("/home/notes.txt"));
    assertThrows(SecurityException.class, () -> home.read("/etc/secrets.txt"));
    assertThrows(SecurityException.class, () -> home.write("/etc/secrets.txt", "owned"));
  }

  // An attenuated capability must not leak the existence of what it cannot reach: a
  // listing is information too, so it reports only its own slice.
  @Test
  void attenuatedCapabilityDoesNotRevealWhatItCannotReach() {
    FileAccess home = Attenuation.scopedTo(root, "/home/");

    assertEquals(Set.of("/home/notes.txt", "/home/todo.txt"), home.list());
  }

  // Dropping the write authority yields something that cannot write, and — this is
  // the part that is easy to get wrong — cannot be cast back into something that
  // can. The narrow capability is a genuinely different object, not the full one
  // seen through a narrower interface, so there is no wider type to recover.
  @Test
  void readOnlyCapabilityCannotBeCastBackToFullAccess() {
    ReadAccess readOnly = Attenuation.readOnly(root);

    assertEquals("hunter2", readOnly.read("/etc/secrets.txt"));
    assertFalse(readOnly instanceof FileAccess);
  }

  // Attenuation composes, and each step is strictly weaker than the last: scoping
  // then read-only leaves a capability that can look inside /home and do nothing
  // else anywhere.
  @Test
  void attenuationComposesAndOnlyEverWeakens() {
    ReadAccess homeReadOnly = Attenuation.readOnly(Attenuation.scopedTo(root, "/home/"));

    assertEquals("buy milk", homeReadOnly.read("/home/notes.txt"));
    assertEquals(Set.of("/home/notes.txt", "/home/todo.txt"), homeReadOnly.list());
    assertThrows(SecurityException.class, () -> homeReadOnly.read("/etc/secrets.txt"));
    assertFalse(homeReadOnly instanceof FileAccess);
  }

  // Delegation is just passing the reference: authority travels with it, and the
  // receiver's powers are established entirely by what it was handed. A reader of
  // this call site can see the plugin's full authority without reading the plugin.
  @Test
  void authorityTravelsWithTheReference() {
    Plugin plugin = new Plugin(Attenuation.readOnly(Attenuation.scopedTo(root, "/home/")));

    assertTrue(plugin.summarize().contains("/home/notes.txt"));
    assertThrows(SecurityException.class, () -> plugin.peek("/etc/secrets.txt"));
  }

  // Revocation reaches a reference that was already given away. The grantee holds
  // the very same object as before — it simply no longer has anything behind it.
  @Test
  void revocationCutsOffACapabilityAlreadyHandedOver() {
    Caretaker caretaker = Caretaker.forwarding(Attenuation.readOnly(root));
    ReadAccess granted = caretaker.access();
    assertEquals("hunter2", granted.read("/etc/secrets.txt"));

    caretaker.revoke();

    assertTrue(caretaker.isRevoked());
    assertThrows(SecurityException.class, () -> granted.read("/etc/secrets.txt"));
  }

  // The grantee cannot undo its own revocation: it was given access() only, never
  // the Caretaker that controls it, and the forwarder exposes no route back to one.
  // Splitting use from control across two objects is what makes the grant safe.
  //
  // There is no assertion here that the granted reference is not a Caretaker,
  // because that cannot be written: `caretaker.access() instanceof Caretaker` is a
  // compile error, since a ReadAccess provably can never be a final unrelated type.
  // The compiler rules it out before the code exists, which is a stronger guarantee
  // than any test could give.
  @Test
  void granteeHoldsNoRouteBackToTheCaretaker() {
    Caretaker caretaker = Caretaker.forwarding(Attenuation.readOnly(root));
    Plugin plugin = new Plugin(caretaker.access());

    caretaker.revoke();

    assertThrows(SecurityException.class, plugin::summarize);
  }

  // Revoking a delegation damages only that delegation. The capability it was
  // derived from is untouched, as is any other grant made from the same source.
  @Test
  void revokingOneGrantLeavesOthersIntact() {
    Caretaker first = Caretaker.forwarding(Attenuation.readOnly(root));
    Caretaker second = Caretaker.forwarding(Attenuation.readOnly(root));

    first.revoke();

    assertThrows(SecurityException.class, () -> first.access().read("/home/notes.txt"));
    assertEquals("buy milk", second.access().read("/home/notes.txt"));
    assertEquals("buy milk", root.read("/home/notes.txt"));
  }
}
