function fibonacci(n) {
    if (n <= 1) {
        return n;
    } else {
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}

function stringProcessing() {
    const text = "Hello world this is a test string for processing".repeat(10000);
    let count = 0;
    const words = text.split(' ');
    
    for (let word of words) {
        if (word.includes('test') || word.includes('string')) {
            count++;
        }
    }
    
    return count;
}

function runJSBenchmarks() {
    return {
        // fibonacci: fibonacci(40),
        stringProcessing: stringProcessing()
    };
}