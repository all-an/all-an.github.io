// Java
// Runnable version of the "Typed error channel" concept snippet.
//
// A typed error channel makes failure an ordinary TYPED return value — Result<T,
// E> is either an Ok carrying a success or an Err carrying an error — instead of
// a thrown exception. flatMap chains fallible steps on the success track, and the
// first Err short-circuits the rest: railway-oriented programming. Java has no
// built-in Result, but a sealed interface + records + pattern-matching switch
// model it cleanly, with the compiler forcing both channels to be handled.
//
// Quick start:  ./run.sh      (or: javac Main.java && java Main)

import java.util.function.Function;

public class Main {
  // The two-channel value. sealed + records means these are the ONLY two cases,
  // so a switch over them is exhaustive and the error type E rides in the type.
  sealed interface Result<T, E> permits Result.Ok, Result.Err {
    record Ok<T, E>(T value) implements Result<T, E> {}
    record Err<T, E>(E error) implements Result<T, E> {}

    // map transforms the SUCCESS channel; an Err passes through untouched.
    default <U> Result<U, E> map(Function<? super T, ? extends U> f) {
      return switch (this) {
        case Ok<T, E> ok -> new Ok<>(f.apply(ok.value()));
        case Err<T, E> err -> new Err<>(err.error());
      };
    }

    // flatMap chains another fallible step. On Ok it runs the next step; on Err
    // it short-circuits, skipping the rest of the chain — the railway switch.
    default <U> Result<U, E> flatMap(Function<? super T, Result<U, E>> f) {
      return switch (this) {
        case Ok<T, E> ok -> f.apply(ok.value());
        case Err<T, E> err -> new Err<>(err.error());
      };
    }
  }

  // Tiny constructors so call sites read as ok(x) / err(msg).
  static <T, E> Result<T, E> ok(T value) {
    return new Result.Ok<>(value);
  }

  static <T, E> Result<T, E> err(E error) {
    return new Result.Err<>(error);
  }

  // Step 1: text -> age. Failure is a returned Err, not a thrown exception.
  static Result<Integer, String> parseAge(String text) {
    try {
      return ok(Integer.parseInt(text));
    } catch (NumberFormatException e) {
      return err("not a number: '" + text + "'");
    }
  }

  // Step 2: the age must be adult. Same typed channel as step 1.
  static Result<Integer, String> checkAdult(int age) {
    return age >= 18 ? ok(age) : err("must be 18+, got " + age);
  }

  public static void main(String[] args) {
    // One success and two failures that derail at different points on the track.
    String[] inputs = {"21", "16", "abc"};
    for (String input : inputs) {
      // The railway: each step stays on the success track until an Err derails
      // it. For "abc", parseAge returns Err and checkAdult never runs.
      Result<String, String> result =
          parseAge(input)
              .flatMap(Main::checkAdult)
              .map(age -> "access granted, age " + age);

      // Pattern-matching switch handles BOTH channels — the compiler rejects
      // forgetting either case, which is how the type forces failure handling.
      String shown = switch (result) {
        case Result.Ok<String, String> ok -> ok.value();
        case Result.Err<String, String> err -> "denied: " + err.error();
      };
      System.out.println(input + " -> " + shown);
    }
  }
}
