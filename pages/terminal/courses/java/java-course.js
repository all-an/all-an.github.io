// java-course.js — Interactive 20-part Java programming language course running inside the Terminal and PseudoVimim

(function () {

// Default buffer filename used for the interactive Java course inside PseudoVimim
const JAVA_COURSE_FILENAME = 'Main.java';

// Suffix appended to evaluation errors in Java course mode to guide the learner to `:hint`
const ERROR_HINT_SUFFIX = ' — type :hint';

// Builds a validator that checks for no runtime errors and verifies the output against a predicate.
function expectOutput(predicate, expectedDesc) {
    return function (evalResult) {
        if (evalResult.isError) {
            return {
                targetRow: evalResult.targetRow,
                text:      evalResult.text + ERROR_HINT_SUFFIX,
                isError:   true,
            };
        }
        const out = (evalResult.text || '').trim();
        if (!out || out === 'ok') {
            return {
                targetRow: evalResult.targetRow,
                text:      'Error: no output produced' + ERROR_HINT_SUFFIX,
                isError:   true,
            };
        }
        if (predicate && !predicate(out)) {
            return {
                targetRow: evalResult.targetRow,
                text:      `Expected ${expectedDesc} (got "${out}")` + ERROR_HINT_SUFFIX,
                isError:   true,
            };
        }
        return {
            targetRow: evalResult.targetRow,
            text:      `${out}  [OK — type :next]`,
            isError:   false,
        };
    };
}

// 20 progressive hands-on Java lessons covering core syntax, OOP, records, collections, and exceptions
const JAVA_COURSE_STEPS = [
    {
        partNumber: 0,
        title:      'Introduction',
        lines: [
            '// welcome to learning the java programming language (20 parts)',
            '// commands: :next (next part) | :prev (previous) | :part <1-20>',
            '//           :hint (code hint) | :score (view mastery score)',
            '// goal: 0 hints and 0 errors on each part until total',
            '// understanding and memorization to be a java developer',
        ],
        hint: '// Type :next and press Enter to begin Part 1 (Hello World).',
    },
    {
        partNumber: 1,
        title:      'Part 1 — Hello World',
        lines: [
            '// part 1/20: write a hello world in java printing "Hello, World!"',
            '// hit ctrl + e at the end of your function to evaluate',
            '',
        ],
        hint: [
            'public class Main {',
            '    public static void main(String[] args) {',
            '        System.out.println("Hello, World!");',
            '    }',
            '}',
        ].join('\n'),
        validate: expectOutput((out) => out.toLowerCase().includes('hello'), '"Hello, World!"'),
    },
    {
        partNumber: 2,
        title:      'Part 2 — Primitives & Arithmetic',
        lines: [
            '// part 2/20: declare int a = 15 and int b = 4',
            '// print their sum (a + b) and product (a * b)',
            '// hit ctrl + e at the end of your function to evaluate',
            '',
        ],
        hint: [
            'public class Main {',
            '    public static void main(String[] args) {',
            '        int a = 15;',
            '        int b = 4;',
            '        System.out.println(a + b);',
            '        System.out.println(a * b);',
            '    }',
            '}',
        ].join('\n'),
        validate: expectOutput((out) => out.includes('19') && out.includes('60'), '19 and 60'),
    },
    {
        partNumber: 3,
        title:      'Part 3 — Type Inference (var) & Casting',
        lines: [
            '// part 3/20: declare double price = 19.99',
            '// cast price to (int) inside var whole and print whole',
            '// hit ctrl + e at the end of your function to evaluate',
            '',
        ],
        hint: [
            'public class Main {',
            '    public static void main(String[] args) {',
            '        double price = 19.99;',
            '        var whole = (int) price;',
            '        System.out.println(whole);',
            '    }',
            '}',
        ].join('\n'),
        validate: expectOutput((out) => out === '19', '19'),
    },
    {
        partNumber: 4,
        title:      'Part 4 — Strings & String Methods',
        lines: [
            '// part 4/20: given String s = "  java developer  "',
            '// trim and uppercase it with s.trim().toUpperCase() and print it',
            '// hit ctrl + e at the end of your function to evaluate',
            '',
        ],
        hint: [
            'public class Main {',
            '    public static void main(String[] args) {',
            '        String s = "  java developer  ";',
            '        System.out.println(s.trim().toUpperCase());',
            '    }',
            '}',
        ].join('\n'),
        validate: expectOutput((out) => out === 'JAVA DEVELOPER', '"JAVA DEVELOPER"'),
    },
    {
        partNumber: 5,
        title:      'Part 5 — Formatted Output (printf)',
        lines: [
            '// part 5/20: given String name = "Alice" and int score = 95',
            '// use System.out.printf to print "Alice: 95"',
            '// hit ctrl + e at the end of your function to evaluate',
            '',
        ],
        hint: [
            'public class Main {',
            '    public static void main(String[] args) {',
            '        String name = "Alice";',
            '        int score = 95;',
            '        System.out.printf("%s: %d%n", name, score);',
            '    }',
            '}',
        ].join('\n'),
        validate: expectOutput((out) => out === 'Alice: 95', '"Alice: 95"'),
    },
    {
        partNumber: 6,
        title:      'Part 6 — Conditionals (if / else)',
        lines: [
            '// part 6/20: given int score = 85, use if / else if / else',
            '// >= 90 print "A", >= 80 print "B", else print "C"',
            '// hit ctrl + e at the end of your function to evaluate',
            '',
        ],
        hint: [
            'public class Main {',
            '    public static void main(String[] args) {',
            '        int score = 85;',
            '        if (score >= 90) {',
            '            System.out.println("A");',
            '        } else if (score >= 80) {',
            '            System.out.println("B");',
            '        } else {',
            '            System.out.println("C");',
            '        }',
            '    }',
            '}',
        ].join('\n'),
        validate: expectOutput((out) => out === 'B', '"B"'),
    },
    {
        partNumber: 7,
        title:      'Part 7 — Modern Switch (case ->)',
        lines: [
            '// part 7/20: given int day = 1, use switch (day)',
            '// case 1 -> print "Monday", default -> print "Other"',
            '// hit ctrl + e at the end of your function to evaluate',
            '',
        ],
        hint: [
            'public class Main {',
            '    public static void main(String[] args) {',
            '        int day = 1;',
            '        switch (day) {',
            '            case 1 -> System.out.println("Monday");',
            '            default -> System.out.println("Other");',
            '        }',
            '    }',
            '}',
        ].join('\n'),
        validate: expectOutput((out) => out === 'Monday', '"Monday"'),
    },
    {
        partNumber: 8,
        title:      'Part 8 — Classic for Loops',
        lines: [
            '// part 8/20: use a for loop (int i = 1; i <= 5; i++)',
            '// accumulate the sum 1..5 and print the total (15)',
            '// hit ctrl + e at the end of your function to evaluate',
            '',
        ],
        hint: [
            'public class Main {',
            '    public static void main(String[] args) {',
            '        int sum = 0;',
            '        for (int i = 1; i <= 5; i++) {',
            '            sum += i;',
            '        }',
            '        System.out.println(sum);',
            '    }',
            '}',
        ].join('\n'),
        validate: expectOutput((out) => out === '15', '15'),
    },
    {
        partNumber: 9,
        title:      'Part 9 — while Loops',
        lines: [
            '// part 9/20: start with int n = 1; while (n < 32) double n (n *= 2)',
            '// print n after the loop finishes (32)',
            '// hit ctrl + e at the end of your function to evaluate',
            '',
        ],
        hint: [
            'public class Main {',
            '    public static void main(String[] args) {',
            '        int n = 1;',
            '        while (n < 32) {',
            '            n *= 2;',
            '        }',
            '        System.out.println(n);',
            '    }',
            '}',
        ].join('\n'),
        validate: expectOutput((out) => out === '32', '32'),
    },
    {
        partNumber: 10,
        title:      'Part 10 — Arrays & Enhanced for-each',
        lines: [
            '// part 10/20: create int[] nums = {10, 20, 30}',
            '// sum all elements using for (int x : nums) and print 60',
            '// hit ctrl + e at the end of your function to evaluate',
            '',
        ],
        hint: [
            'public class Main {',
            '    public static void main(String[] args) {',
            '        int[] nums = {10, 20, 30};',
            '        int sum = 0;',
            '        for (int x : nums) {',
            '            sum += x;',
            '        }',
            '        System.out.println(sum);',
            '    }',
            '}',
        ].join('\n'),
        validate: expectOutput((out) => out === '60', '60'),
    },
    {
        partNumber: 11,
        title:      'Part 11 — Arrays.sort & Arrays.toString',
        lines: [
            '// part 11/20: create int[] arr = {9, 3, 7, 1}',
            '// sort it with Arrays.sort(arr) and print Arrays.toString(arr)',
            '// hit ctrl + e at the end of your function to evaluate',
            '',
        ],
        hint: [
            'import java.util.Arrays;',
            '',
            'public class Main {',
            '    public static void main(String[] args) {',
            '        int[] arr = {9, 3, 7, 1};',
            '        Arrays.sort(arr);',
            '        System.out.println(Arrays.toString(arr));',
            '    }',
            '}',
        ].join('\n'),
        validate: expectOutput((out) => out === '[1, 3, 7, 9]', '"[1, 3, 7, 9]"'),
    },
    {
        partNumber: 12,
        title:      'Part 12 — Static Methods',
        lines: [
            '// part 12/20: define static int square(int x) returning x * x',
            '// call square(12) inside main and print the result (144)',
            '// hit ctrl + e at the end of your function to evaluate',
            '',
        ],
        hint: [
            'public class Main {',
            '    static int square(int x) {',
            '        return x * x;',
            '    }',
            '    public static void main(String[] args) {',
            '        System.out.println(square(12));',
            '    }',
            '}',
        ].join('\n'),
        validate: expectOutput((out) => out === '144', '144'),
    },
    {
        partNumber: 13,
        title:      'Part 13 — Recursion',
        lines: [
            '// part 13/20: write recursive static int factorial(int n)',
            '// print factorial(5) inside main (120)',
            '// hit ctrl + e at the end of your function to evaluate',
            '',
        ],
        hint: [
            'public class Main {',
            '    static int factorial(int n) {',
            '        if (n <= 1) return 1;',
            '        return n * factorial(n - 1);',
            '    }',
            '    public static void main(String[] args) {',
            '        System.out.println(factorial(5));',
            '    }',
            '}',
        ].join('\n'),
        validate: expectOutput((out) => out === '120', '120'),
    },
    {
        partNumber: 14,
        title:      'Part 14 — Classes, Fields & Constructors',
        lines: [
            '// part 14/20: create class User with String name & constructor User(String n)',
            '// instantiate User u = new User("Allan") in main and print u.name',
            '// hit ctrl + e at the end of your function to evaluate',
            '',
        ],
        hint: [
            'class User {',
            '    String name;',
            '    User(String n) {',
            '        this.name = n;',
            '    }',
            '}',
            'public class Main {',
            '    public static void main(String[] args) {',
            '        User u = new User("Allan");',
            '        System.out.println(u.name);',
            '    }',
            '}',
        ].join('\n'),
        validate: expectOutput((out) => out === 'Allan', '"Allan"'),
    },
    {
        partNumber: 15,
        title:      'Part 15 — Instance Methods',
        lines: [
            '// part 15/20: create class Box with int w, int h, constructor, and int area()',
            '// print new Box(6, 7).area() inside main (42)',
            '// hit ctrl + e at the end of your function to evaluate',
            '',
        ],
        hint: [
            'class Box {',
            '    int w, h;',
            '    Box(int w, int h) {',
            '        this.w = w;',
            '        this.h = h;',
            '    }',
            '    int area() {',
            '        return this.w * this.h;',
            '    }',
            '}',
            'public class Main {',
            '    public static void main(String[] args) {',
            '        Box b = new Box(6, 7);',
            '        System.out.println(b.area());',
            '    }',
            '}',
        ].join('\n'),
        validate: expectOutput((out) => out === '42', '42'),
    },
    {
        partNumber: 16,
        title:      'Part 16 — Java Records (record)',
        lines: [
            '// part 16/20: define record Point(int x, int y) {}',
            '// create Point p = new Point(3, 4) in main and print p',
            '// hit ctrl + e at the end of your function to evaluate',
            '',
        ],
        hint: [
            'public class Main {',
            '    record Point(int x, int y) {}',
            '    public static void main(String[] args) {',
            '        Point p = new Point(3, 4);',
            '        System.out.println(p);',
            '    }',
            '}',
        ].join('\n'),
        validate: expectOutput((out) => out === 'Point[x=3, y=4]', '"Point[x=3, y=4]"'),
    },
    {
        partNumber: 17,
        title:      'Part 17 — Dynamic Lists (ArrayList)',
        lines: [
            '// part 17/20: create List<String> list = new ArrayList<>()',
            '// add "Java" and "JVM", then print list',
            '// hit ctrl + e at the end of your function to evaluate',
            '',
        ],
        hint: [
            'import java.util.*;',
            '',
            'public class Main {',
            '    public static void main(String[] args) {',
            '        List<String> list = new ArrayList<>();',
            '        list.add("Java");',
            '        list.add("JVM");',
            '        System.out.println(list);',
            '    }',
            '}',
        ].join('\n'),
        validate: expectOutput((out) => out === '[Java, JVM]', '"[Java, JVM]"'),
    },
    {
        partNumber: 18,
        title:      'Part 18 — Key-Value Maps (HashMap)',
        lines: [
            '// part 18/20: create Map<String, Integer> map = new HashMap<>()',
            '// put("java", 21) and print map.get("java")',
            '// hit ctrl + e at the end of your function to evaluate',
            '',
        ],
        hint: [
            'import java.util.*;',
            '',
            'public class Main {',
            '    public static void main(String[] args) {',
            '        Map<String, Integer> map = new HashMap<>();',
            '        map.put("java", 21);',
            '        System.out.println(map.get("java"));',
            '    }',
            '}',
        ].join('\n'),
        validate: expectOutput((out) => out === '21', '21'),
    },
    {
        partNumber: 19,
        title:      'Part 19 — StringBuilder',
        lines: [
            '// part 19/20: create new StringBuilder("avaJ")',
            '// call .reverse().toString() and print "Java"',
            '// hit ctrl + e at the end of your function to evaluate',
            '',
        ],
        hint: [
            'public class Main {',
            '    public static void main(String[] args) {',
            '        StringBuilder sb = new StringBuilder("avaJ");',
            '        System.out.println(sb.reverse().toString());',
            '    }',
            '}',
        ].join('\n'),
        validate: expectOutput((out) => out === 'Java', '"Java"'),
    },
    {
        partNumber: 20,
        title:      'Part 20 — Exception Handling (try / catch)',
        lines: [
            '// part 20/20: wrap int x = 10 / 0; inside try { ... }',
            '// catch (ArithmeticException e) and print "Caught"',
            '// hit ctrl + e at the end of your function to evaluate',
            '',
        ],
        hint: [
            'public class Main {',
            '    public static void main(String[] args) {',
            '        try {',
            '            int x = 10 / 0;',
            '            System.out.println(x);',
            '        } catch (ArithmeticException e) {',
            '            System.out.println("Caught");',
            '        }',
            '    }',
            '}',
        ].join('\n'),
        validate: expectOutput((out) => out.toLowerCase().includes('caught'), '"Caught"'),
    },
];

let currentStepIndex = 0;
let courseStarted    = false;
let modalPopupEl     = null;

// Score tracking across the course session (per part and overall totals)
let totalHintsUsed  = 0;
let totalErrors     = 0;
const partStats     = {};

// Ensures a stats record exists for the given course step index.
function getPartStat(stepIdx) {
    if (!partStats[stepIdx]) {
        partStats[stepIdx] = {
            hints:     0,
            errors:    0,
            completed: false,
        };
    }
    return partStats[stepIdx];
}

// Returns the initial buffer lines when the Java course opens for the first time.
function getInitialLines() {
    currentStepIndex = 0;
    courseStarted    = true;
    return [...JAVA_COURSE_STEPS[0].lines];
}

// Returns whether the course session has already been initialized in this page load.
function isStarted() {
    return courseStarted;
}

// Advances to the next lesson step when the learner runs `:next` in PseudoVimim.
function nextStep() {
    hideModalPopup();
    if (currentStepIndex < JAVA_COURSE_STEPS.length - 1) {
        currentStepIndex++;
        getPartStat(currentStepIndex);
        return {
            advanced: true,
            lines:    [...JAVA_COURSE_STEPS[currentStepIndex].lines],
        };
    }
    return {
        advanced: false,
        lines:    null,
    };
}

// Moves back to the previous lesson step when the learner runs `:prev` in PseudoVimim.
function prevStep() {
    hideModalPopup();
    if (currentStepIndex > 0) {
        currentStepIndex--;
        getPartStat(currentStepIndex);
        return {
            advanced: true,
            lines:    [...JAVA_COURSE_STEPS[currentStepIndex].lines],
        };
    }
    return {
        advanced: false,
        lines:    null,
    };
}

// Jumps directly to a specific lesson part number (`:part 1` .. `:part 20`).
function goToPart(partNum) {
    hideModalPopup();
    const idx = parseInt(partNum, 10);
    if (!Number.isNaN(idx) && idx >= 0 && idx < JAVA_COURSE_STEPS.length) {
        currentStepIndex = idx;
        getPartStat(currentStepIndex);
        return {
            advanced: true,
            lines:    [...JAVA_COURSE_STEPS[currentStepIndex].lines],
        };
    }
    return {
        advanced: false,
        lines:    null,
    };
}

// Formats or validates a Ctrl+E evaluation result and updates error/completion counters for `:score`.
function formatEvalResult(evalResult) {
    if (!evalResult) {
        return evalResult;
    }
    const step   = JAVA_COURSE_STEPS[currentStepIndex];
    let   result = evalResult;

    if (step && typeof step.validate === 'function') {
        result = step.validate(evalResult);
    } else if (evalResult.isError) {
        result = {
            targetRow: evalResult.targetRow,
            text:      evalResult.text + ERROR_HINT_SUFFIX,
            isError:   true,
        };
    }

    // Track errors and completion on active course parts (partNumber >= 1)
    if (step && step.partNumber >= 1) {
        const stat = getPartStat(currentStepIndex);
        if (result.isError) {
            totalErrors++;
            stat.errors++;
        } else {
            stat.completed = true;
        }
    }

    return result;
}

// Ensures the shared floating mini-terminal modal element exists inside `#terminal`.
function ensureModalElement() {
    const terminalEl = document.getElementById('terminal');
    if (!terminalEl) {
        return null;
    }

    if (!modalPopupEl) {
        modalPopupEl = document.createElement('div');
        modalPopupEl.id = 'vim-hint-popup';
        modalPopupEl.innerHTML = `
            <div class="hint-term-titlebar">
                <span class="term-dot red" id="hint-close-dot" title="Close modal"></span>
                <span class="term-dot yellow"></span>
                <span class="term-dot green"></span>
                <span class="hint-term-title" id="hint-term-title">hint — Main.java</span>
                <span class="hint-term-close" id="hint-close-label">[Esc] close</span>
            </div>
            <pre class="hint-term-body" id="hint-term-code"></pre>
        `;
        terminalEl.appendChild(modalPopupEl);

        modalPopupEl.querySelector('#hint-close-dot').addEventListener('click', hideModalPopup);
        modalPopupEl.querySelector('#hint-close-label').addEventListener('click', hideModalPopup);
    }

    return modalPopupEl;
}

// Increments the hint counter (for active course parts) and opens the mini-terminal code hint modal.
function showHintPopup() {
    const step     = JAVA_COURSE_STEPS[currentStepIndex];
    const hintCode = step && step.hint ? step.hint : null;
    if (!hintCode) {
        return false;
    }

    if (step && step.partNumber >= 1) {
        totalHintsUsed++;
        getPartStat(currentStepIndex).hints++;
    }

    const modal = ensureModalElement();
    if (!modal) {
        return false;
    }

    modal.querySelector('#hint-term-title').textContent = `hint — ${step.title}`;
    const codeContainer = modal.querySelector('#hint-term-code');
    codeContainer.innerHTML = '';

    // Highlight each line of the hint using JavaHighlight if available
    const lines = hintCode.split('\n');
    lines.forEach((lineText, idx) => {
        const lineDiv = document.createElement('div');
        if (window.JavaHighlight && lineText.length > 0) {
            const tokens = window.JavaHighlight.tokenizeLine(lineText);
            for (const tok of tokens) {
                if (tok.cls) {
                    const s = document.createElement('span');
                    s.className   = tok.cls;
                    s.textContent = tok.text;
                    lineDiv.appendChild(s);
                } else {
                    lineDiv.appendChild(document.createTextNode(tok.text));
                }
            }
        } else {
            lineDiv.textContent = lineText || (idx < lines.length - 1 ? ' ' : '');
        }
        codeContainer.appendChild(lineDiv);
    });

    modal.classList.add('active');
    return true;
}

// Opens a compact mini-terminal score modal displaying progress across all 20 parts without scrolling.
function showScorePopup() {
    const modal = ensureModalElement();
    if (!modal) {
        return false;
    }

    modal.querySelector('#hint-term-title').textContent = 'score — java course (20 parts)';
    const codeContainer = modal.querySelector('#hint-term-code');
    codeContainer.innerHTML = '';

    const totalParts = JAVA_COURSE_STEPS.length - 1;
    let completedCount = 0;
    let perfectCount   = 0;

    // Build a compact 4-row grid of the 20 parts (5 parts per row) so it fits without scrollbars
    const gridRows = [];
    for (let r = 0; r < 4; r++) {
        const cells = [];
        for (let c = 1; c <= 5; c++) {
            const pIdx = r * 5 + c;
            const stat = getPartStat(pIdx);
            let badge = '·';
            if (stat.completed) {
                completedCount++;
                if (stat.hints === 0 && stat.errors === 0) {
                    perfectCount++;
                    badge = '★';
                } else {
                    badge = '✓';
                }
            } else if (pIdx === currentStepIndex) {
                badge = '▶';
            }
            const label = `P${String(pIdx).padStart(2, '0')}[${badge}]`;
            cells.push(label);
        }
        gridRows.push('  ' + cells.join('  '));
    }

    const activeStep = JAVA_COURSE_STEPS[currentStepIndex];
    const activeStat = getPartStat(currentStepIndex);
    const isPerfect  = totalHintsUsed === 0 && totalErrors === 0;

    const summaryLines = [
        '══════ Java Developer Mastery Score ══════',
        'Goal: 0 hints & 0 errors on all 20 parts',
        `Current: ${activeStep.title} (Hints: ${activeStat.hints}, Errors: ${activeStat.errors})`,
        '',
        'Parts (★=Perfect  ✓=Done  ▶=Active  ·=Todo):',
        ...gridRows,
        '',
        '──────────────────────────────────────────',
        `Completed Parts    : ${completedCount} / ${totalParts} (${perfectCount} perfect)`,
        `Total Hints Called : ${totalHintsUsed}`,
        `Total Errors       : ${totalErrors}`,
        `Mastery Rating     : ${isPerfect ? 'PERFECT (0 hints, 0 errors)' : 'Keep practicing for 0 hints & 0 errors'}`,
    ];

    summaryLines.forEach((lineText) => {
        const lineDiv = document.createElement('div');
        lineDiv.textContent = lineText || ' ';
        codeContainer.appendChild(lineDiv);
    });

    modal.classList.add('active');
    return true;
}

// Hides the mini-terminal modal (hint or score) if it is currently visible.
function hideModalPopup() {
    if (modalPopupEl) {
        modalPopupEl.classList.remove('active');
    }
}

// Returns true when the mini-terminal modal (hint or score) is open on screen.
function isHintOpen() {
    return Boolean(modalPopupEl && modalPopupEl.classList.contains('active'));
}

// Configures the terminal for Java course mode (`?course=java`) and opens PseudoVimim.
function setupTerminal(termContext) {
    const { commands, virtualFiles, termShell, printLine, scrollBottom } = termContext;

    // Keep only the Java course file (`Main.java`) in the virtual directory so `ls` shows only it
    for (const key of Object.keys(virtualFiles)) {
        delete virtualFiles[key];
    }
    virtualFiles[JAVA_COURSE_FILENAME] = JAVA_COURSE_STEPS[currentStepIndex].lines.join('\n');

    // Launches or resumes the PseudoVimim editor on the Java course buffer.
    function openCourseEditor() {
        termShell.classList.add('hidden');
        window.PseudoVimim.open(
            JAVA_COURSE_FILENAME,
            virtualFiles,
            (exitMsg) => {
                hideModalPopup();
                termShell.classList.remove('hidden');
                if (exitMsg) {
                    printLine(exitMsg);
                }
                scrollBottom();
            },
            { course: window.JavaCourse }
        );
    }

    // In the Java course terminal, `help` lists only `learn java`
    commands.help = function () {
        return [
            'Available commands:',
            '  learn java        Return to the PseudoVimim Java course',
            '',
        ];
    };

    // Typing `learn java` returns the learner to the PseudoVimim Java course
    commands.learn = function (args) {
        if (!args[0] || args[0].toLowerCase() !== 'java') {
            return ['Usage: learn java'];
        }
        openCourseEditor();
        return null;
    };

    // Point the titlebar back controls to the Skillset page
    const backLink = document.getElementById('term-back');
    const redDot   = document.querySelector('.term-dot.red');
    if (backLink) {
        backLink.href        = '../skillset/skillset.html';
        backLink.textContent = '← skillset';
    }
    if (redDot) {
        redDot.href  = '../skillset/skillset.html';
        redDot.title = 'Back to Skillset';
    }

    openCourseEditor();
}

window.JavaCourse = {
    filename:       JAVA_COURSE_FILENAME,
    getInitialLines,
    isStarted,
    nextStep,
    prevStep,
    goToPart,
    formatEvalResult,
    showHintPopup,
    showScorePopup,
    hideHintPopup:  hideModalPopup,
    isHintOpen,
    setupTerminal,
};

})();
