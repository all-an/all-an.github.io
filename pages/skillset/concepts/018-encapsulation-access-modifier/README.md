# Encapsulation / access modifier — runnable Java example

Java version of the concept snippet, runnable with plain `javac`/`java`. Shows
how `private` state plus public, validated mutators keep an invariant
("balance >= 0") that cannot be broken by callers.

## Files

| File | Purpose |
| --- | --- |
| `Main.java` | The runnable snippet. |
| `run.sh` | Compiles and runs `Main.java`. |
| `index.html` / `style.css` | The concept page. |

No external jars are needed. Compiled `*.class` files are git-ignored.

## Run it (recommended)

```sh
chmod +x run.sh   # make the script executable (only needed once)
./run.sh          # compiles and runs Main.java
```

## Run it manually

```sh
javac Main.java
java  Main
```

## Expected output

```
balance: 120.0
blocked: insufficient funds
```

`balance` is `private` — even though it is a plain mutable `double`, the
compiler will not let anything outside `BankAccount` touch it. Every change
must go through `deposit` or `withdraw`, which validate input. The second
output line shows the guard catching an overdraft attempt and refusing it.
That combination of hidden state and validated access is what makes
encapsulation more than just convention: it is a compile-time guarantee that
the type's invariants hold.
