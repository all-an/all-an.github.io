package com.example.concepts;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

// The protected resource itself. Nothing outside this file can touch the data: the
// store instance is never handed out, only a capability that closes over it.
//
// This is what "no ambient authority" means concretely. There is no static
// `FileStore.read(path)` anyone can call from anywhere, so there is no need to ask
// *who is calling* and no access-control list to consult. Code that was never given
// a capability cannot express the request at all — it has nothing to call it on.
// Compare the ambient-authority design every mainstream language ships with, where
// `Files.readString(path)` is reachable from any line of code in the process and
// the only defence is a check of the caller's identity.
public final class FileStore {

  private final Map<String, String> files = new LinkedHashMap<>();

  // Private: a store can only come into existence together with its root capability.
  private FileStore() {
  }

  // Create a store and return the *only* reference that can reach it — the root of
  // all authority over it, the way an operating system hands a fresh process its
  // initial capabilities. Every narrower capability in the system is derived from
  // this one; authority can be given away and narrowed, but never conjured up.
  public static FileAccess createWithRootAccess() {
    return new RootAccess(new FileStore());
  }

  // The full-authority capability. Private and final, so no other code can build one
  // — capabilities are *unforgeable*. The only way to hold one is to be given it.
  private record RootAccess(FileStore store) implements FileAccess {

    @Override
    public String read(String path) {
      String contents = store.files.get(path);
      if (contents == null) {
        throw new SecurityException("no such file: " + path);
      }
      return contents;
    }

    @Override
    public void write(String path, String text) {
      store.files.put(path, text);
    }

    @Override
    public Set<String> list() {
      return Set.copyOf(store.files.keySet());
    }
  }
}
