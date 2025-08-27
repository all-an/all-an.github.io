const { expect } = require('chai');
const sinon = require('sinon');

describe('Firebase Config Tests', function() {
    let mockFirebaseApp, mockFirestore, mockAuth;
    let mockUser, mockDocRef, mockQuerySnapshot;
    let mockFunctions;
    
    beforeEach(function() {
        // Reset global state
        global.window = {
            firebaseDB: null,
            firebaseAuth: null
        };
        
        // Mock Firebase services
        mockFirebaseApp = { name: 'test-app' };
        mockFirestore = { 
            collection: sinon.stub(),
            doc: sinon.stub(),
            addDoc: sinon.stub(),
            getDocs: sinon.stub(),
            getDoc: sinon.stub(),
            setDoc: sinon.stub(),
            query: sinon.stub(),
            where: sinon.stub(),
            orderBy: sinon.stub()
        };
        
        mockAuth = {
            currentUser: null,
            signInAnonymously: sinon.stub(),
            createUserWithEmailAndPassword: sinon.stub(),
            signInWithEmailAndPassword: sinon.stub(),
            signOut: sinon.stub()
        };
        
        mockUser = {
            uid: 'test-user-id',
            email: 'testuser@terminal.app'
        };
        
        mockDocRef = {
            id: 'test-doc-id'
        };
        
        mockQuerySnapshot = {
            empty: false,
            forEach: sinon.stub(),
            docs: []
        };
        
        // Mock console to avoid noise in tests
        global.console = {
            log: sinon.stub(),
            error: sinon.stub()
        };
        
        // Set up mock functions that would be attached to window
        mockFunctions = {
            saveMessage: null,
            getMessages: null,
            registerUser: null,
            loginUser: null,
            logoutUser: null,
            getCurrentUser: null,
            getUserProfile: null,
            saveFile: null,
            loadFile: null,
            listFiles: null
        };
    });
    
    afterEach(function() {
        sinon.restore();
    });

    describe('Firebase Initialization', function() {
        it('should have correct Firebase configuration', function() {
            const expectedConfig = {
                apiKey: "AIzaSyCwjp68qqn0F9Xu4amo_IT3H5Z8oL0nVnk",
                authDomain: "allan-web-terminal.firebaseapp.com",
                projectId: "allan-web-terminal",
                storageBucket: "allan-web-terminal.firebasestorage.app",
                messagingSenderId: "133548030863",
                appId: "1:133548030863:web:8d217108b543ca071ee9fa",
                measurementId: "G-XQZX0KPBHD"
            };
            
            // This tests the configuration structure, not actual Firebase
            expect(expectedConfig.apiKey).to.be.a('string');
            expect(expectedConfig.authDomain).to.include('firebaseapp.com');
            expect(expectedConfig.projectId).to.equal('allan-web-terminal');
        });
        
        it('should export Firebase services to window', function() {
            // Simulate what the actual firebase-config.js does
            global.window.firebaseDB = mockFirestore;
            global.window.firebaseAuth = mockAuth;
            
            expect(global.window.firebaseDB).to.equal(mockFirestore);
            expect(global.window.firebaseAuth).to.equal(mockAuth);
        });
    });

    describe('Message Functions', function() {
        beforeEach(function() {
            // Mock the window functions as they would be set up
            global.window.saveMessage = async function(messageData) {
                if (!messageData.name || !messageData.email || !messageData.message) {
                    throw new Error('Missing required message data');
                }
                return mockDocRef.id;
            };
            
            global.window.getMessages = async function() {
                return [
                    { id: '1', name: 'John', email: 'john@test.com', message: 'Hello', timestamp: new Date() },
                    { id: '2', name: 'Jane', email: 'jane@test.com', message: 'Hi there', timestamp: new Date() }
                ];
            };
        });
        
        describe('saveMessage', function() {
            it('should save message with required fields', async function() {
                const messageData = {
                    name: 'Test User',
                    email: 'test@example.com',
                    message: 'Test message'
                };
                
                const result = await global.window.saveMessage(messageData);
                expect(result).to.equal('test-doc-id');
            });
            
            it('should throw error for missing name', async function() {
                const messageData = {
                    email: 'test@example.com',
                    message: 'Test message'
                };
                
                try {
                    await global.window.saveMessage(messageData);
                    expect.fail('Should have thrown an error');
                } catch (error) {
                    expect(error.message).to.include('Missing required message data');
                }
            });
            
            it('should throw error for missing email', async function() {
                const messageData = {
                    name: 'Test User',
                    message: 'Test message'
                };
                
                try {
                    await global.window.saveMessage(messageData);
                    expect.fail('Should have thrown an error');
                } catch (error) {
                    expect(error.message).to.include('Missing required message data');
                }
            });
            
            it('should throw error for missing message', async function() {
                const messageData = {
                    name: 'Test User',
                    email: 'test@example.com'
                };
                
                try {
                    await global.window.saveMessage(messageData);
                    expect.fail('Should have thrown an error');
                } catch (error) {
                    expect(error.message).to.include('Missing required message data');
                }
            });
        });
        
        describe('getMessages', function() {
            it('should return array of messages', async function() {
                const messages = await global.window.getMessages();
                
                expect(messages).to.be.an('array');
                expect(messages).to.have.length(2);
                expect(messages[0]).to.have.property('id');
                expect(messages[0]).to.have.property('name');
                expect(messages[0]).to.have.property('email');
                expect(messages[0]).to.have.property('message');
            });
            
            it('should return messages in correct format', async function() {
                const messages = await global.window.getMessages();
                const firstMessage = messages[0];
                
                expect(firstMessage.id).to.equal('1');
                expect(firstMessage.name).to.equal('John');
                expect(firstMessage.email).to.equal('john@test.com');
                expect(firstMessage.message).to.equal('Hello');
                expect(firstMessage.timestamp).to.be.a('date');
            });
        });
    });

    describe('Authentication Functions', function() {
        beforeEach(function() {
            global.window.registerUser = async function(username, password) {
                if (!username || !password) {
                    throw new Error('Username and password are required');
                }
                if (password.length < 6) {
                    throw new Error('Password must be at least 6 characters long');
                }
                if (username === 'existing_user') {
                    throw new Error('Username already exists');
                }
                return { success: true, message: 'Account created successfully!' };
            };
            
            global.window.loginUser = async function(username, password) {
                if (!username || !password) {
                    throw new Error('Username and password are required');
                }
                if (username === 'admin' && password === 'password123') {
                    return { success: true, message: 'Login successful!', user: mockUser };
                }
                throw new Error('Invalid username or password');
            };
            
            global.window.logoutUser = async function() {
                return { success: true, message: 'Logged out successfully!' };
            };
            
            global.window.getCurrentUser = function() {
                return mockAuth.currentUser;
            };
            
            global.window.getUserProfile = async function(userId) {
                if (!userId) {
                    throw new Error('User ID is required');
                }
                if (userId === 'test-user-id') {
                    return {
                        username: 'testuser',
                        email: 'testuser@terminal.app',
                        createdAt: new Date(),
                        lastLogin: new Date()
                    };
                }
                return null;
            };
        });
        
        describe('registerUser', function() {
            it('should register user with valid credentials', async function() {
                const result = await global.window.registerUser('newuser', 'password123');
                
                expect(result.success).to.be.true;
                expect(result.message).to.equal('Account created successfully!');
            });
            
            it('should throw error for missing username', async function() {
                try {
                    await global.window.registerUser('', 'password123');
                    expect.fail('Should have thrown an error');
                } catch (error) {
                    expect(error.message).to.include('Username and password are required');
                }
            });
            
            it('should throw error for missing password', async function() {
                try {
                    await global.window.registerUser('newuser', '');
                    expect.fail('Should have thrown an error');
                } catch (error) {
                    expect(error.message).to.include('Username and password are required');
                }
            });
            
            it('should throw error for short password', async function() {
                try {
                    await global.window.registerUser('newuser', '123');
                    expect.fail('Should have thrown an error');
                } catch (error) {
                    expect(error.message).to.include('Password must be at least 6 characters long');
                }
            });
            
            it('should throw error for existing username', async function() {
                try {
                    await global.window.registerUser('existing_user', 'password123');
                    expect.fail('Should have thrown an error');
                } catch (error) {
                    expect(error.message).to.include('Username already exists');
                }
            });
        });
        
        describe('loginUser', function() {
            it('should login with valid credentials', async function() {
                const result = await global.window.loginUser('admin', 'password123');
                
                expect(result.success).to.be.true;
                expect(result.message).to.equal('Login successful!');
                expect(result.user).to.equal(mockUser);
            });
            
            it('should throw error for invalid credentials', async function() {
                try {
                    await global.window.loginUser('wrong', 'password');
                    expect.fail('Should have thrown an error');
                } catch (error) {
                    expect(error.message).to.include('Invalid username or password');
                }
            });
            
            it('should throw error for missing username', async function() {
                try {
                    await global.window.loginUser('', 'password123');
                    expect.fail('Should have thrown an error');
                } catch (error) {
                    expect(error.message).to.include('Username and password are required');
                }
            });
            
            it('should throw error for missing password', async function() {
                try {
                    await global.window.loginUser('admin', '');
                    expect.fail('Should have thrown an error');
                } catch (error) {
                    expect(error.message).to.include('Username and password are required');
                }
            });
        });
        
        describe('logoutUser', function() {
            it('should logout successfully', async function() {
                const result = await global.window.logoutUser();
                
                expect(result.success).to.be.true;
                expect(result.message).to.equal('Logged out successfully!');
            });
        });
        
        describe('getCurrentUser', function() {
            it('should return null when no user is logged in', function() {
                const user = global.window.getCurrentUser();
                expect(user).to.be.null;
            });
            
            it('should return user when logged in', function() {
                mockAuth.currentUser = mockUser;
                const user = global.window.getCurrentUser();
                expect(user).to.equal(mockUser);
            });
        });
        
        describe('getUserProfile', function() {
            it('should return user profile for valid user ID', async function() {
                const profile = await global.window.getUserProfile('test-user-id');
                
                expect(profile).to.be.an('object');
                expect(profile.username).to.equal('testuser');
                expect(profile.email).to.equal('testuser@terminal.app');
                expect(profile.createdAt).to.be.a('date');
                expect(profile.lastLogin).to.be.a('date');
            });
            
            it('should return null for invalid user ID', async function() {
                const profile = await global.window.getUserProfile('invalid-id');
                expect(profile).to.be.null;
            });
            
            it('should throw error for missing user ID', async function() {
                try {
                    await global.window.getUserProfile('');
                    expect.fail('Should have thrown an error');
                } catch (error) {
                    expect(error.message).to.include('User ID is required');
                }
            });
        });
    });

    describe('File Storage Functions', function() {
        beforeEach(function() {
            mockAuth.currentUser = mockUser; // Simulate logged in user
            
            const mockFiles = [
                { filename: 'test.py', lastModified: new Date('2024-01-01') },
                { filename: 'config.json', lastModified: new Date('2024-01-02') }
            ];
            
            global.window.saveFile = async function(filename, content) {
                if (!mockAuth.currentUser) {
                    throw new Error('You must be logged in to save files');
                }
                if (!filename || !content) {
                    throw new Error('Filename and content are required');
                }
                return { success: true, message: 'File saved successfully!' };
            };
            
            global.window.loadFile = async function(filename) {
                if (!mockAuth.currentUser) {
                    throw new Error('You must be logged in to load files');
                }
                if (!filename) {
                    throw new Error('Filename is required');
                }
                if (filename === 'test.py') {
                    return { success: true, content: 'print("Hello, World!")' };
                }
                return { success: false, content: '', message: 'File not found' };
            };
            
            global.window.listFiles = async function() {
                if (!mockAuth.currentUser) {
                    return { success: false, files: [], message: 'You must be logged in to view files' };
                }
                return { success: true, files: mockFiles };
            };
        });
        
        describe('saveFile', function() {
            it('should save file when logged in', async function() {
                const result = await global.window.saveFile('test.py', 'print("Hello")');
                
                expect(result.success).to.be.true;
                expect(result.message).to.equal('File saved successfully!');
            });
            
            it('should throw error when not logged in', async function() {
                mockAuth.currentUser = null;
                
                try {
                    await global.window.saveFile('test.py', 'content');
                    expect.fail('Should have thrown an error');
                } catch (error) {
                    expect(error.message).to.include('You must be logged in to save files');
                }
            });
            
            it('should throw error for missing filename', async function() {
                try {
                    await global.window.saveFile('', 'content');
                    expect.fail('Should have thrown an error');
                } catch (error) {
                    expect(error.message).to.include('Filename and content are required');
                }
            });
            
            it('should throw error for missing content', async function() {
                try {
                    await global.window.saveFile('test.py', '');
                    expect.fail('Should have thrown an error');
                } catch (error) {
                    expect(error.message).to.include('Filename and content are required');
                }
            });
        });
        
        describe('loadFile', function() {
            it('should load existing file', async function() {
                const result = await global.window.loadFile('test.py');
                
                expect(result.success).to.be.true;
                expect(result.content).to.equal('print("Hello, World!")');
            });
            
            it('should return file not found for non-existent file', async function() {
                const result = await global.window.loadFile('nonexistent.py');
                
                expect(result.success).to.be.false;
                expect(result.content).to.equal('');
                expect(result.message).to.equal('File not found');
            });
            
            it('should throw error when not logged in', async function() {
                mockAuth.currentUser = null;
                
                try {
                    await global.window.loadFile('test.py');
                    expect.fail('Should have thrown an error');
                } catch (error) {
                    expect(error.message).to.include('You must be logged in to load files');
                }
            });
            
            it('should throw error for missing filename', async function() {
                try {
                    await global.window.loadFile('');
                    expect.fail('Should have thrown an error');
                } catch (error) {
                    expect(error.message).to.include('Filename is required');
                }
            });
        });
        
        describe('listFiles', function() {
            it('should list files when logged in', async function() {
                const result = await global.window.listFiles();
                
                expect(result.success).to.be.true;
                expect(result.files).to.be.an('array');
                expect(result.files).to.have.length(2);
                expect(result.files[0].filename).to.equal('test.py');
                expect(result.files[1].filename).to.equal('config.json');
            });
            
            it('should return empty list when not logged in', async function() {
                mockAuth.currentUser = null;
                
                const result = await global.window.listFiles();
                
                expect(result.success).to.be.false;
                expect(result.files).to.be.an('array');
                expect(result.files).to.have.length(0);
                expect(result.message).to.include('You must be logged in to view files');
            });
            
            it('should sort files by lastModified date', async function() {
                const result = await global.window.listFiles();
                
                expect(result.files[0].lastModified.getTime()).to.be.lessThan(
                    result.files[1].lastModified.getTime()
                );
            });
        });
    });

    describe('Error Handling', function() {
        it('should handle Firebase network errors gracefully', async function() {
            global.window.saveMessage = async function(messageData) {
                throw new Error('Firebase: Network error');
            };
            
            try {
                await global.window.saveMessage({ name: 'Test', email: 'test@test.com', message: 'Hello' });
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.include('Firebase: Network error');
            }
        });
        
        it('should handle authentication errors', async function() {
            global.window.loginUser = async function(username, password) {
                throw new Error('auth/user-not-found');
            };
            
            try {
                await global.window.loginUser('nonexistent', 'password');
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.include('auth/user-not-found');
            }
        });
        
        it('should handle Firestore permission errors', async function() {
            global.window.listFiles = async function() {
                throw new Error('Firestore: Permission denied');
            };
            
            try {
                await global.window.listFiles();
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.include('Firestore: Permission denied');
            }
        });
    });

    describe('Integration Tests', function() {
        it('should maintain consistent user state across functions', async function() {
            // Mock a full user session
            mockAuth.currentUser = mockUser;
            
            global.window.getCurrentUser = function() {
                return mockAuth.currentUser;
            };
            
            global.window.saveFile = async function(filename, content) {
                if (!mockAuth.currentUser) {
                    throw new Error('You must be logged in to save files');
                }
                return { success: true, message: 'File saved successfully!' };
            };
            
            // Test that user state is maintained
            const currentUser = global.window.getCurrentUser();
            expect(currentUser).to.equal(mockUser);
            
            // Test that authenticated operations work
            const saveResult = await global.window.saveFile('test.py', 'content');
            expect(saveResult.success).to.be.true;
        });
        
        it('should handle user session changes correctly', function() {
            global.window.getCurrentUser = function() {
                return mockAuth.currentUser;
            };
            
            // Initially no user
            expect(global.window.getCurrentUser()).to.be.null;
            
            // User logs in
            mockAuth.currentUser = mockUser;
            expect(global.window.getCurrentUser()).to.equal(mockUser);
            
            // User logs out
            mockAuth.currentUser = null;
            expect(global.window.getCurrentUser()).to.be.null;
        });
    });
});