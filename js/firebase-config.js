// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, where, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';
import { getAuth, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCwjp68qqn0F9Xu4amo_IT3H5Z8oL0nVnk", // Safe to expose - this is a public identifier, not a secret
  authDomain: "allan-web-terminal.firebaseapp.com",
  projectId: "allan-web-terminal",
  storageBucket: "allan-web-terminal.firebasestorage.app",
  messagingSenderId: "133548030863",
  appId: "1:133548030863:web:8d217108b543ca071ee9fa",
  measurementId: "G-XQZX0KPBHD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Export Firebase services
window.firebaseDB = db;
window.firebaseAuth = auth;

// Auto sign in anonymously
signInAnonymously(auth).then(() => {
    console.log('Signed in anonymously');
}).catch((error) => {
    console.error('Error signing in:', error);
});

// Firebase utility functions
window.saveMessage = async function(messageData) {
    try {
        const docRef = await addDoc(collection(db, 'messages'), {
            ...messageData,
            timestamp: new Date(),
            userId: auth.currentUser?.uid
        });
        console.log('Message saved with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error saving message:', error);
        throw error;
    }
};

window.getMessages = async function() {
    try {
        const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        const messages = [];
        querySnapshot.forEach((doc) => {
            messages.push({ id: doc.id, ...doc.data() });
        });
        return messages;
    } catch (error) {
        console.error('Error getting messages:', error);
        throw error;
    }
};

// User authentication functions
window.registerUser = async function(username, password) {
    try {
        // Check if username already exists
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', username));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            throw new Error('Username already exists');
        }
        
        // Create user with email-like format (username@terminal.app)
        const email = `${username}@terminal.app`;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Store user profile in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            username: username,
            email: email,
            createdAt: new Date(),
            lastLogin: new Date()
        });
        
        return { success: true, message: 'Account created successfully!' };
    } catch (error) {
        throw new Error(error.message);
    }
};

window.loginUser = async function(username, password) {
    try {
        const email = `${username}@terminal.app`;
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Update last login
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            lastLogin: new Date()
        }, { merge: true });
        
        return { success: true, message: 'Login successful!', user: userCredential.user };
    } catch (error) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            throw new Error('Invalid username or password');
        }
        throw new Error(error.message);
    }
};

window.logoutUser = async function() {
    try {
        await signOut(auth);
        return { success: true, message: 'Logged out successfully!' };
    } catch (error) {
        throw new Error(error.message);
    }
};

window.getCurrentUser = function() {
    return auth.currentUser;
};

window.getUserProfile = async function(userId) {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            return userDoc.data();
        }
        return null;
    } catch (error) {
        throw new Error(error.message);
    }
};

// File storage functions
window.saveFile = async function(filename, content) {
    try {
        // Check if we're in local directory
        if ((window.terminalState && window.terminalState.currentDirectory === 'local') ||
            (typeof terminalState !== 'undefined' && terminalState.currentDirectory === 'local')) {
            // Save to localStorage for local
            localStorage.setItem(`local:${filename}`, content);
            
            // Also track files for ls command
            const existingFiles = JSON.parse(localStorage.getItem('local-files') || '[]');
            if (!existingFiles.includes(filename)) {
                existingFiles.push(filename);
                localStorage.setItem('local-files', JSON.stringify(existingFiles));
            }
            
            return { success: true, message: 'File saved to local!' };
        }
        
        // Default behavior: save to Firebase
        const user = auth.currentUser;
        if (!user) {
            throw new Error('You must be logged in to save files');
        }
        
        await setDoc(doc(db, 'files', `${user.uid}_${filename}`), {
            filename: filename,
            content: content,
            userId: user.uid,
            lastModified: new Date()
        });
        
        return { success: true, message: 'File saved successfully!' };
    } catch (error) {
        throw new Error(error.message);
    }
};

window.loadFile = async function(filename) {
    try {
        // Check if we're in local directory
        if ((window.terminalState && window.terminalState.currentDirectory === 'local') ||
            (typeof terminalState !== 'undefined' && terminalState.currentDirectory === 'local')) {
            // Load from localStorage for local
            const content = localStorage.getItem(`local:${filename}`);
            if (content !== null) {
                return { success: true, content: content };
            } else {
                return { success: false, content: '', message: 'File not found in local' };
            }
        }
        
        // Default behavior: load from Firebase
        const user = auth.currentUser;
        if (!user) {
            throw new Error('You must be logged in to load files');
        }
        
        const fileDoc = await getDoc(doc(db, 'files', `${user.uid}_${filename}`));
        if (fileDoc.exists()) {
            return { success: true, content: fileDoc.data().content };
        } else {
            return { success: false, content: '', message: 'File not found' };
        }
    } catch (error) {
        throw new Error(error.message);
    }
};

window.listFiles = async function() {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, files: [], message: 'You must be logged in to view files' };
        }
        
        const filesRef = collection(db, 'files');
        const q = query(filesRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        const files = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            files.push({
                filename: data.filename,
                lastModified: data.lastModified.toDate()
            });
        });
        
        // Sort files by lastModified in JavaScript instead of Firestore
        files.sort((a, b) => b.lastModified - a.lastModified);
        
        return { success: true, files: files };
    } catch (error) {
        throw new Error(error.message);
    }
};

console.log('Firebase initialized successfully');

