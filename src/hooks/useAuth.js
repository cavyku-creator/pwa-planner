import { useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  signInAnonymously,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // 新增：错误信息

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 封装一下，带错误捕获
  const wrap = (fn) => async (...args) => {
    setError(null);
    try {
      return await fn(...args);
    } catch (e) {
      setError(e);
      throw e;
    }
  };

  const loginGoogle = wrap(async () => {
    try {
      return await signInWithPopup(auth, googleProvider);
    } catch (e) {
      // 有些环境会拦截弹窗，自动回退到 redirect
      if (e?.code === 'auth/popup-blocked' || e?.code === 'auth/popup-closed-by-user') {
        return await signInWithRedirect(auth, googleProvider);
      }
      throw e;
    }
  });

  return {
    user,
    loading,
    error, // 组件里可用来显示错误提示
    loginEmail: wrap((email, pw) => signInWithEmailAndPassword(auth, email, pw)),
    signupEmail: wrap((email, pw) => createUserWithEmailAndPassword(auth, email, pw)),
    loginGoogle,
    loginAnon: wrap(() => signInAnonymously(auth)), // 可选：需要时手动匿名登录
    logout: wrap(() => signOut(auth)),
  };
}
