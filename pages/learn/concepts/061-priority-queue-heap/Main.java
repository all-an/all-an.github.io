// Java
// Runnable version of the "Priority queue / heap" concept snippet.
// Pure javac/java — no external dependencies.
//
// Quick start:
//   ./run.sh
//
// Or manually:
//   javac Main.java
//   java  Main
public class Main {

  // A min-heap is a complete binary tree flattened into an array, where every
  // parent is <= both of its children. The smallest element is therefore always
  // at the root (index 0), so a priority queue reads its highest-priority item
  // in O(1) and inserts/removes in O(log n) by sifting one element up or down.
  // For a node at index i: parent is (i - 1) / 2, children are 2i + 1 / 2i + 2.
  static final class MinHeap {
    private final int[] heap; // complete binary tree stored level by level
    private int size = 0;     // number of elements currently in the heap

    MinHeap(int capacity) {
      heap = new int[capacity];
    }

    // Adds a value, then restores heap order by sifting it up toward the root
    // while it is smaller than its parent. O(log n).
    void offer(int value) {
      heap[size] = value; // place the new value in the next free slot
      int i = size;
      size++;
      while (i > 0) {
        int parent = (i - 1) / 2;            // parent of node i in the array
        if (heap[i] >= heap[parent]) break;  // order restored: stop sifting
        swap(i, parent);
        i = parent;
      }
    }

    // Removes and returns the smallest value (the root), then restores the heap
    // by moving the last element into the root and sifting it down. O(log n).
    int poll() {
      int min = heap[0]; // root is always the smallest element
      size--;
      heap[0] = heap[size]; // move the last element into the root
      int i = 0;
      while (true) {
        int left = 2 * i + 1;  // left child of node i
        int right = 2 * i + 2; // right child of node i
        int smallest = i;
        if (left < size && heap[left] < heap[smallest]) smallest = left;
        if (right < size && heap[right] < heap[smallest]) smallest = right;
        if (smallest == i) break; // node sits above both children: done
        swap(i, smallest);
        i = smallest;
      }
      return min;
    }

    // Exchanges the elements at two array positions.
    private void swap(int a, int b) {
      int tmp = heap[a];
      heap[a] = heap[b];
      heap[b] = tmp;
    }
  }

  public static void main(String[] args) {
    // A priority queue with room for five elements.
    MinHeap pq = new MinHeap(5);

    // Insert priorities in scrambled order...
    int[] values = {5, 1, 4, 2, 3};
    for (int value : values) pq.offer(value);

    // ...and they come back smallest-first, regardless of insertion order.
    // Each poll returns the current minimum and re-heapifies in O(log n).
    System.out.println("poll: " + pq.poll()); // 1
    System.out.println("poll: " + pq.poll()); // 2
    System.out.println("poll: " + pq.poll()); // 3
    System.out.println("poll: " + pq.poll()); // 4
    System.out.println("poll: " + pq.poll()); // 5
  }
}
