package com.example.concepts;

import java.util.Set;

// A capability granting only the authority to look: read and list, never write.
// It is a separate interface rather than a supertype of FileAccess on purpose — see
// the note there. A holder of this type cannot write, and cannot cast its way to
// something that can, because the object it holds genuinely is not a FileAccess.
public interface ReadAccess {

  // Read a file's contents. Throws if the path is outside this capability's reach.
  String read(String path);

  // Every path this capability can reach.
  Set<String> list();
}
