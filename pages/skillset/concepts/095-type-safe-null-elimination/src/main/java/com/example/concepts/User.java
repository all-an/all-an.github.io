package com.example.concepts;

import java.util.Optional;

// A user whose manager is optional in the domain itself — the chief executive has
// none. Saying that with Optional rather than a nullable field puts the fact in the
// signature, where every caller sees it, instead of in documentation nobody reads.
public record User(String name, Optional<String> managerName) {
}
