package com.example.concepts;

// Demonstrates the object-capability model: authority is an unforgeable reference
// you were handed, not an identity someone checks. A plugin is given a narrow slice
// of a file store, proves it can do exactly that and no more, and then has the slice
// taken away — all without a single check of who it is.
public class Main {

  public static void main(String[] args) {
    // System startup: the store and the root of all authority over it are created
    // together. This reference is the only way into the data that will ever exist.
    FileAccess root = FileStore.createWithRootAccess();
    root.write("/home/notes.txt", "buy milk");
    root.write("/home/todo.txt", "write concept 094");
    root.write("/etc/secrets.txt", "hunter2");

    System.out.println("Root capability sees: " + root.list().stream().sorted().toList());
    System.out.println();

    // Attenuate twice, each step strictly weaker: full authority -> the /home
    // subtree -> read-only within it. This is least privilege, done by construction.
    FileAccess home = Attenuation.scopedTo(root, "/home/");
    ReadAccess homeReadOnly = Attenuation.readOnly(home);

    // Wrap it in a caretaker so the grant can be withdrawn later. The plugin gets
    // access(); we keep the caretaker, and with it the power to revoke.
    Caretaker caretaker = Caretaker.forwarding(homeReadOnly);
    Plugin plugin = new Plugin(caretaker.access());

    System.out.println("Plugin can do its job:");
    System.out.print(plugin.summarize());
    System.out.println();

    // It cannot see outside its slice — it holds no capability that reaches there.
    try {
      plugin.peek("/etc/secrets.txt");
    } catch (SecurityException denied) {
      System.out.println("Plugin reading /etc/secrets.txt: " + denied.getMessage());
    }

    // And it cannot cast its way back to write authority: the object it holds is a
    // wrapper that genuinely is not a FileAccess, not a FileAccess in disguise.
    System.out.println("Plugin's capability is a FileAccess? "
        + (caretaker.access() instanceof FileAccess));
    System.out.println();

    // Revocation reaches a reference already handed over: the plugin still holds
    // the same object, but there is no longer anything behind it.
    caretaker.revoke();
    try {
      plugin.summarize();
    } catch (SecurityException revoked) {
      System.out.println("After revoke(), plugin: " + revoked.getMessage());
    }

    // The grantor's own capability is untouched — revoking a delegation does not
    // damage the authority it was derived from.
    System.out.println("Root still works: " + root.read("/etc/secrets.txt"));
  }
}
