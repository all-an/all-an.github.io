// Java (Vavr)
// Runnable version of the "Persistent / immutable collection" concept snippet.
//
// Vavr is an external library, so one jar must be on the classpath:
//   vavr-0.10.4.jar  — io.vavr.collection.List and other persistent collections
//
// Quick start (downloads the jar into ./lib, then compiles and runs):
//   ./run.sh
//
// Or manually, once the jar is in ./lib:
//   javac -cp "lib/*" Main.java
//   java  -cp "lib/*:." Main      (use ';' instead of ':' on Windows)
import io.vavr.collection.List;

public class Main {
  public static void main(String[] args) {
    // The original list — fully immutable, no setters, no in-place mutation.
    List<Integer> original = List.of(1, 2, 3);

    // "Mutation" returns a NEW list; original is untouched.
    // Internally, extended is just a cons cell pointing at original — no copy is made.
    List<Integer> extended = original.prepend(0);

    // Another derived list, again sharing structure with the originals.
    List<Integer> dropped = original.tail();

    // All three references coexist independently; the original is unchanged.
    System.out.println("original: " + original);
    System.out.println("extended: " + extended);
    System.out.println("dropped:  " + dropped);

    // Proof of structural sharing: extended.tail() IS the original list,
    // not a copy — same object identity. That is what makes the collection
    // "persistent" rather than merely "immutable".
    System.out.println("extended.tail() == original ? " + (extended.tail() == original));
  }
}
