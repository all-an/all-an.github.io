import strutils

proc fibonacci(n: int): int =
  if n <= 1:
    return n
  else:
    return fibonacci(n - 1) + fibonacci(n - 2)

proc stringProcessing(): int =
  let text = "Hello world this is a test string for processing".repeat(10000)
  var count = 0
  let words = text.split(' ')
  
  for word in words:
    if "test" in word or "string" in word:
      count += 1
      
  return count

when defined(js):
  {.emit: """
function runNimBenchmarks() {
  return {
    stringProcessing: stringProcessing()
  };
}
""".}