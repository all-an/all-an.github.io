/**
 * Jest setup file for terminal.js tests
 * This file runs before each test suite
 */

// Mock browser APIs that aren't available in Node.js test environment
global.window = global;

// Mock URL and Blob APIs
global.URL = {
  createObjectURL: jest.fn(() => 'mock-url'),
  revokeObjectURL: jest.fn()
};

global.Blob = jest.fn((content, options) => ({
  content,
  options,
  size: content ? content.join('').length : 0,
  type: options ? options.type : 'text/plain'
}));

// Mock document with minimal DOM API
global.document = {
  createElement: jest.fn((tagName) => {
    const element = {
      tagName: tagName.toUpperCase(),
      href: '',
      download: '',
      click: jest.fn(),
      appendChild: jest.fn(),
      removeChild: jest.fn(),
      style: {},
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn()
      }
    };
    return element;
  }),
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  },
  getElementById: jest.fn(() => null),
  querySelector: jest.fn(() => null),
  querySelectorAll: jest.fn(() => [])
};

// Mock localStorage  
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index) => Object.keys(store)[index] || null)
  };
})();

global.localStorage = localStorageMock;

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});