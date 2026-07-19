package com.example.concepts;

// One instruction of the intermediate representation — the portable middle language
// every frontend compiles *to* and every backend compiles *from*. It is a stack
// machine instruction set: operands are pushed onto an operand stack and each
// operation consumes what it needs from there, which is why an `Arith` needs no
// operand field of its own. That design is why real bytecodes are compact and easy
// to generate — the same reason JVM bytecode, CLR IL and WASM are all stack based.
//
// The instruction set is deliberately tiny and *flat*: unlike the source AST it has
// no nesting. Compiling a tree into this linear form is the essential lowering step
// — structure that was implicit in the tree becomes explicit in the ordering.
public sealed interface Instruction permits Instruction.Push, Instruction.Load, Arith {

  // How this instruction appears in a disassembly listing.
  String text();

  // Push a constant onto the operand stack.
  record Push(int value) implements Instruction {

    @Override
    public String text() {
      return "push " + value;
    }
  }

  // Push the current value of a named variable onto the operand stack. The name is
  // resolved by the backend, against whatever environment it is running with.
  record Load(String name) implements Instruction {

    @Override
    public String text() {
      return "load " + name;
    }
  }
}
