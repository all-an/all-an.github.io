package com.example.concepts;

import java.util.Map;
import java.util.Optional;

// Demonstrates type-safe null elimination: absence lives in the type, so a chain of
// lookups that might each find nothing composes without a single null check.
public class Main {

  public static void main(String[] args) {
    User ceo = new User("ana", Optional.empty());              // nobody above her
    User boss = new User("bruno", Optional.of("ana"));
    User dev = new User("carla", Optional.of("bruno"));
    Directory directory = new Directory(Map.of("ana", ceo, "bruno", boss, "carla", dev));

    // Present, absent, and missing entirely — all handled the same way.
    System.out.println("carla's manager : " + directory.find("carla")
        .flatMap(User::managerName).orElse("none"));
    System.out.println("ana's manager   : " + directory.find("ana")
        .flatMap(User::managerName).orElse("none"));
    System.out.println("dora's manager  : " + directory.find("dora")
        .flatMap(User::managerName).orElse("none"));
    System.out.println();

    // Two lookups deep, each able to come up empty. No nesting, no null checks.
    System.out.println("carla's grand-manager : " + directory.grandManagerOf("carla").orElse("none"));
    System.out.println("bruno's grand-manager : " + directory.grandManagerOf("bruno").orElse("none"));
  }
}
