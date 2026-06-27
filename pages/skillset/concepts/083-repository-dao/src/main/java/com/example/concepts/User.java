package com.example.concepts;

// The domain object the repository stores and returns. It is a plain, immutable
// value (a record): an id plus the data we keep about a user. The repository
// deals in these domain objects, never in rows, SQL, or storage details — that
// is exactly what the Repository / DAO pattern hides from the rest of the app.
public record User(String id, String name, String email) {
}
