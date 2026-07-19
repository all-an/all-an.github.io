package com.example.concepts;

import java.util.Set;

// A capability granting full authority over a file store: read, write and list.
// Holding a reference to one of these *is* the permission — there is no identity to
// check and no access-control list to consult, because the only way to be able to
// call these methods is for someone to have handed you the object.
//
// Deliberately NOT a supertype of ReadAccess. If a full capability could be upcast
// to a narrow one, then anyone given the narrow view could simply cast it back and
// recover the authority that was supposedly withheld. Narrowing has to go through a
// wrapper that genuinely drops the extra methods — see Attenuation.
public interface FileAccess {

  // Read a file's contents. Throws if the path is outside this capability's reach.
  String read(String path);

  // Write a file's contents — the authority a read-only holder must not have.
  void write(String path, String text);

  // Every path this capability can reach. Note it lists what *this* capability can
  // see, not what the store contains: an attenuated capability reports less.
  Set<String> list();
}
