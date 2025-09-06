/**
 * Jest tests for terminal.js downloadFiles function
 */

// Import the actual functions from terminal.js
const { 
    downloadFiles, 
    downloadLocalFiles, 
    terminalState 
} = require('../terminal.js');

describe('downloadFiles', () => {
    beforeEach(() => {
        // Set initial state for each test
        terminalState.currentDirectory = '';
    });

    describe('when in local directory (currentDirectory === "")', () => {
        beforeEach(() => {
            terminalState.currentDirectory = '';
        });

        test('should return no files message when localStorage is empty', () => {
            localStorage.setItem('local-files', '[]');
            
            const result = downloadFiles();
            
            expect(result).toBe('No local files found to download.');
        });

        test('should download files from local-files array format', () => {
            const testFiles = ['test1.txt', 'test2.py'];
            localStorage.setItem('local-files', JSON.stringify(testFiles));
            // Set the actual file contents in localStorage
            localStorage.setItem('test1.txt', 'Hello World');
            localStorage.setItem('test2.py', 'print("test")');
            
            const result = downloadFiles();
            
            expect(result).toBe('Downloaded 2 local files to Downloads folder.');
            // Test that the core functionality works - files are processed
            expect(global.Blob).toHaveBeenCalledTimes(2);
        });

        test('should download files from string array format', () => {
            const testFiles = ['hello.py', 'script.js'];
            localStorage.setItem('local-files', JSON.stringify(testFiles));
            localStorage.setItem('hello.py', 'print("hello")');
            localStorage.setItem('script.js', 'console.log("test");');
            
            const result = downloadFiles();
            
            expect(result).toBe('Downloaded 2 local files to Downloads folder.');
        });

        test('should handle files with some missing content', () => {
            const testFiles = ['file1.txt', 'file2.py', 'file3.js'];
            localStorage.setItem('local-files', JSON.stringify(testFiles));
            // Only set content for 2 out of 3 files
            localStorage.setItem('file1.txt', 'content1');
            localStorage.setItem('file2.py', 'print("hello")');
            // file3.js has no content
            
            const result = downloadFiles();
            
            expect(result).toBe('Downloaded 2 local files to Downloads folder.');
        });

        test('should skip files with no content', () => {
            const testFiles = ['exists.txt', 'missing.txt'];
            localStorage.setItem('local-files', JSON.stringify(testFiles));
            localStorage.setItem('exists.txt', 'content');
            // missing.txt is not in localStorage
            
            const result = downloadFiles();
            
            expect(result).toBe('Downloaded 1 local files to Downloads folder.');
        });

        test('should handle localStorage parse errors', () => {
            localStorage.setItem('local-files', 'invalid-json');
            
            const result = downloadFiles();
            
            expect(result).toMatch(/Error downloading local files:/);
        });

        test('should create proper download elements', () => {
            const testFiles = ['test.txt'];
            localStorage.setItem('local-files', JSON.stringify(testFiles));
            localStorage.setItem('test.txt', 'test content');
            
            const result = downloadFiles();
            
            expect(result).toBe('Downloaded 1 local files to Downloads folder.');
        });

        test('should create blob with correct content and type', () => {
            const testFiles = ['test.txt'];
            localStorage.setItem('local-files', JSON.stringify(testFiles));
            localStorage.setItem('test.txt', 'test content');
            
            downloadFiles();
            
            expect(global.Blob).toHaveBeenCalledWith(['test content'], { type: 'text/plain' });
        });
    });

    describe('when not in local directory', () => {
        test('should return error message when in different directory', () => {
            terminalState.currentDirectory = 'projects';
            
            const result = downloadFiles();
            
            expect(result).toBe('download-files: Command only available in local mode.');
        });

        test('should return error message when in home directory', () => {
            terminalState.currentDirectory = '~';
            
            const result = downloadFiles();
            
            expect(result).toBe('download-files: Command only available in local mode.');
        });
    });
});

describe('downloadLocalFiles', () => {
    // No additional setup needed - handled by jest.setup.js

    test('should handle empty local-files gracefully', () => {
        // No local-files key in localStorage
        const result = downloadLocalFiles();
        
        expect(result).toBe('No local files found to download.');
    });

    test('should handle URL creation and cleanup', () => {
        const testFiles = ['test.txt'];
        localStorage.setItem('local-files', JSON.stringify(testFiles));
        localStorage.setItem('test.txt', 'test content');
        
        downloadLocalFiles();
        
        expect(global.URL.createObjectURL).toHaveBeenCalled();
        expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
    });
});