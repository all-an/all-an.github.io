// Runnable specs for the solve sessions, keyed by source slug. An algorithm
// without an entry still opens the editor, but Run has no test harness yet.
//
// Each spec provides:
//   fn          - the function name the learner must define
//   jsStarter   - starter code shown on the JavaScript page
//   javaStarter - starter code shown on the Java page
//   reference   - a correct JS implementation, used to compute the expected
//                 output and to run the Java page (where real Java cannot
//                 execute in the browser, so this JS runs "behind the curtains")
//   tests       - argument tuples to run the function against
const CHALLENGES = {
  reverseastring: {
    fn: 'reverse',
    jsStarter: 'function reverse(s) {\n  // your code here\n}\n',
    javaStarter: 'static String reverse(String s) {\n    // your code here\n}\n',
    reference: (s) => [...s].reverse().join(''),
    tests: [['hello'], ['racecar'], ['OpenAI'], ['']],
  },
};
