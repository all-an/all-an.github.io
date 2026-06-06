// Java
// Runnable version of the "Trie / persistent map" concept snippet.
// Pure javac/java — no external dependencies.
//
// Quick start:
//   ./run.sh
//
// Or manually:
//   javac Main.java
//   java  Main
import java.util.HashMap;
import java.util.Map;

public class Main {

  // One node of the trie, immutable. `value` holds the value of the key that
  // ends at this node (null if no key ends here); `children` maps the next
  // character of a key to the subtree below it.
  record Node(Integer value, Map<Character, Node> children) {}

  // Persistent insert: returns a NEW trie holding key->value while leaving
  // `root` untouched. It rebuilds only the nodes along this one key's path and
  // shares every sibling subtree by reference — that is the structural sharing.
  static Node put(Node root, String key, int value, int depth) {
    // Carry over the value already stored at this node, plus a private copy of
    // its child map so the original node is never mutated.
    Integer existingValue = (root == null) ? null : root.value();
    Map<Character, Node> children =
        new HashMap<>((root == null) ? Map.of() : root.children());

    // End of the key: store the value here, keeping the existing children.
    if (depth == key.length()) {
      return new Node(value, children);
    }

    // Otherwise recurse into (and rebuild only) the child for this character.
    char c = key.charAt(depth);
    Node oldChild = (root == null) ? null : root.children().get(c);
    children.put(c, put(oldChild, key, value, depth + 1));
    return new Node(existingValue, children);
  }

  // Looks up a key, walking one character at a time; returns its value or null.
  static Integer get(Node root, String key) {
    Node node = root;
    for (int i = 0; i < key.length() && node != null; i++) {
      node = node.children().get(key.charAt(i));
    }
    return (node == null) ? null : node.value();
  }

  public static void main(String[] args) {
    // Version 1: a trie with two keys sharing the prefix "ca".
    Node v1 = put(null, "car", 1, 0);
    v1 = put(v1, "cat", 2, 0);

    // Version 2: derived from v1 by adding "dog". v1 is NOT modified.
    Node v2 = put(v1, "dog", 3, 0);

    // Both versions coexist; the older one answers exactly as it always did.
    System.out.println("v1 car = " + get(v1, "car")); // 1
    System.out.println("v1 cat = " + get(v1, "cat")); // 2
    System.out.println("v1 dog = " + get(v1, "dog")); // null — v1 never saw "dog"
    System.out.println("v2 dog = " + get(v2, "dog")); // 3

    // Structural sharing proof: adding "dog" only rebuilt the root and the new
    // 'd' path, so the entire 'c' subtree is the SAME object in both versions.
    Node v1c = v1.children().get('c');
    Node v2c = v2.children().get('c');
    System.out.println("shared 'c' subtree: " + (v1c == v2c)); // true
  }
}
