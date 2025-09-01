// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider /*, signInAnonymously */ } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  memoryLocalCache,
} from "firebase/firestore";

// —— 用你控制台里这份配置（与截图一致）——
const firebaseConfig = {
  apiKey: "AIzaSyB98AKnoczo0v1bONEUE1TbJZmLdacO4hA",
  authDomain: "my-pwa-demo-90173.firebaseapp.com",
  projectId: "my-pwa-demo-90173",
  storageBucket: "my-pwa-demo-90173.firebasestorage.app",
  messagingSenderId: "511108905583",
  appId: "1:511108905583:web:80723f281dd465c2722b9a",
  measurementId: "G-VF5JSY92GV"
};

const app = initializeApp(firebaseConfig);

// ---- Auth ----
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 可选：需要匿名登录再打开，且务必在控制台开启 Anonymous provider
// signInAnonymously(auth).catch(err => console.error("匿名登录失败：", err));

// ---- Firestore（新版持久化 + 多标签页）----
let db;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
} catch (e) {
  console.warn("IndexedDB 持久化不可用，回退内存缓存：", e);
  db = initializeFirestore(app, { localCache: memoryLocalCache() });
}
export { db };
