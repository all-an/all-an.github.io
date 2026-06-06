// Java
// Runnable version of the "Ring buffer / circular queue" concept snippet.
// Pure javac/java — no external dependencies.
//
// Quick start:
//   ./run.sh
//
// Or manually:
//   javac Main.java
//   java  Main
public class Main {

  // A fixed-capacity FIFO queue backed by a single array whose ends are joined
  // into a ring. `head` is the index of the oldest element; `tail` is the next
  // free slot. Both advance with modulo, so they wrap past the end of the array
  // instead of shifting elements or reallocating.
  static final class RingBuffer {
    private final int[] slots; // backing storage; its length is the capacity
    private int head = 0;      // index of the next element to remove
    private int tail = 0;      // index of the next free slot to fill
    private int size = 0;      // current number of elements (0..capacity)

    RingBuffer(int capacity) {
      slots = new int[capacity];
    }

    // Adds value to the back. Returns false (without overwriting) when full.
    boolean enqueue(int value) {
      if (size == slots.length) return false;
      slots[tail] = value;
      tail = (tail + 1) % slots.length; // wrap to 0 after the last slot
      size++;
      return true;
    }

    // Removes and returns the oldest value. Throws when empty.
    int dequeue() {
      if (size == 0) throw new IllegalStateException("empty");
      int value = slots[head];
      head = (head + 1) % slots.length; // wrap to 0 after the last slot
      size--;
      return value;
    }
  }

  public static void main(String[] args) {
    // A ring with room for three elements.
    RingBuffer ring = new RingBuffer(3);

    ring.enqueue(1);
    ring.enqueue(2);
    ring.enqueue(3);
    System.out.println("full? rejects 4th: " + ring.enqueue(4)); // false

    // Free two slots from the front...
    System.out.println("dequeue: " + ring.dequeue()); // 1
    System.out.println("dequeue: " + ring.dequeue()); // 2

    // ...then add two more. tail has now wrapped to the start of the array,
    // reusing slots 0 and 1 — no shifting, no reallocation.
    ring.enqueue(4);
    ring.enqueue(5);

    // FIFO order is preserved across the wrap: 3, then 4, then 5.
    System.out.println("dequeue: " + ring.dequeue()); // 3
    System.out.println("dequeue: " + ring.dequeue()); // 4
    System.out.println("dequeue: " + ring.dequeue()); // 5
  }
}
