import "@testing-library/jest-dom";

// Mock scrollIntoView for JSDOM (only in browser-like environment)
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = jest.fn();
}

// Web APIs polyfills for Firebase Node.js compatibility
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fetch = require("node-fetch");
global.fetch = fetch;
global.Response = fetch.Response;
global.Request = fetch.Request;
global.Headers = fetch.Headers;

// Firebase環境変数のモック設定
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "mock-api-key";
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "mock-project.firebaseapp.com";
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "mock-project";
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "mock-project.appspot.com";
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "123456789";
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "1:123456789:web:abc123def456";

// Firebase Auth/Firestore のモック
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
  })),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  User: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  onSnapshot: jest.fn(),
  DocumentReference: jest.fn(),
  CollectionReference: jest.fn(),
  Timestamp: {
    fromDate: jest.fn(date => ({
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: (date.getTime() % 1000) * 1000000,
      toDate: () => date,
    })),
    now: jest.fn(() => ({
      seconds: Math.floor(Date.now() / 1000),
      nanoseconds: (Date.now() % 1000) * 1000000,
      toDate: () => new Date(),
    })),
  },
}));

jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({})),
}));
global.fetch = jest.fn();
global.Response = class Response {
  constructor(body, options) {
    this.body = body;
    this.status = options?.status || 200;
    this.ok = this.status >= 200 && this.status < 300;
    this.headers = new Map(Object.entries(options?.headers || {}));
  }
  async json() {
    return JSON.parse(this.body);
  }
  async text() {
    return String(this.body);
  }
};
global.Request = class Request {
  constructor(url, options) {
    this.url = url;
    this.method = options?.method || "GET";
    this.headers = new Map(Object.entries(options?.headers || {}));
  }
};
global.Headers = class Headers extends Map { };
