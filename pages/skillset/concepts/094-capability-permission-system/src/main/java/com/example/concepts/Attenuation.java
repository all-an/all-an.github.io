package com.example.concepts;

import java.util.Set;
import java.util.stream.Collectors;

// Attenuation: deriving a *weaker* capability from one you already hold. This is how
// authority is distributed under the principle of least privilege — you never hand a
// component your full capability and ask it to behave, you hand it exactly the sliver
// it needs and it is then incapable of more.
//
// Attenuation only ever goes one way. Every method here takes a capability and
// returns a strictly weaker one; nothing in this class can widen anything, so no
// sequence of calls can recover authority that was dropped.
public final class Attenuation {

  // Static-only holder; there is nothing to instantiate.
  private Attenuation() {
  }

  // Drop the authority to write, keeping the authority to look. The result is a
  // genuinely different object of a type that has no write method — not the same
  // object viewed through a narrower interface, which the holder could simply cast
  // back. That distinction is the whole point: attenuation must be a wrapper.
  public static ReadAccess readOnly(FileAccess full) {
    return new ReadOnlyView(full);
  }

  // Restrict a capability to one subtree. The result is still a full FileAccess —
  // it can read and write — but only within the prefix, so it is strictly weaker
  // than what was passed in.
  public static FileAccess scopedTo(FileAccess full, String pathPrefix) {
    return new ScopedView(full, pathPrefix);
  }

  // Forwards only reads. Private and final: nobody outside can construct one, and
  // it does not implement FileAccess, so `(FileAccess) readOnlyCapability` fails.
  private record ReadOnlyView(FileAccess full) implements ReadAccess {

    @Override
    public String read(String path) {
      return full.read(path);
    }

    @Override
    public Set<String> list() {
      return full.list();
    }
  }

  // Forwards everything, but only for paths inside the prefix. The underlying
  // capability is held privately, so a holder of the scoped view has no route to
  // the wider one it was derived from.
  private record ScopedView(FileAccess full, String pathPrefix) implements FileAccess {

    @Override
    public String read(String path) {
      return full.read(checkInScope(path));
    }

    @Override
    public void write(String path, String text) {
      full.write(checkInScope(path), text);
    }

    // Only the paths this view can reach — an attenuated capability must not even
    // reveal what lies outside it, since a listing is itself information.
    @Override
    public Set<String> list() {
      return full.list().stream()
          .filter(path -> path.startsWith(pathPrefix))
          .collect(Collectors.toUnmodifiableSet());
    }

    // Refuse anything outside the subtree. This is the one place a capability check
    // looks like a traditional permission check — but note what is *not* here:
    // nothing asks who the caller is. The answer depends only on which capability
    // was used, so the same code called by anyone gets the same result.
    private String checkInScope(String path) {
      if (!path.startsWith(pathPrefix)) {
        throw new SecurityException("outside this capability's scope: " + path);
      }
      return path;
    }
  }
}
