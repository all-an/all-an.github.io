package com.example.concepts;

// Untrusted third-party code, written by someone else and running in your process.
// It is not sandboxed, not checked and not trusted — and it does not need to be.
//
// Look at what it has: one ReadAccess, received at construction. That reference is
// the entirety of its authority over the outside world. It cannot write, because a
// ReadAccess has no write method and the object behind it is not a FileAccess to
// cast to. It cannot reach files outside the slice it was given, because it holds
// no capability that reaches them. And it cannot go looking for one, because there
// is no global entry point to look at — nothing here can reach a FileStore.
//
// This is the security argument for capabilities: the plugin's authority is
// established entirely by what was passed to its constructor, which the caller can
// read at the call site, rather than by reasoning about every line the plugin might
// execute.
public final class Plugin {

  private final ReadAccess files;

  public Plugin(ReadAccess files) {
    this.files = files;
  }

  // Do the job it was hired for, using only the authority it was given.
  public String summarize() {
    StringBuilder summary = new StringBuilder();
    for (String path : files.list().stream().sorted().toList()) {
      summary.append(path).append(" (").append(files.read(path).length()).append(" chars)\n");
    }
    return summary.toString();
  }

  // Try to read a specific path. Whether this succeeds is decided entirely by which
  // capability the plugin was handed — not by who the plugin is.
  public String peek(String path) {
    return files.read(path);
  }
}
