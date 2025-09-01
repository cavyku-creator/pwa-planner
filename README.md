# PWA Planner Starter (React + Vite + Firebase)

## 使用方法
1. 解压本项目
2. 安装依赖：`npm i`
3. 替换 `src/firebase.js` 里的 `firebaseConfig`
4. 开发：`npm run dev`
5. 构建：`npm run build`（输出到 `dist/`）
6. 部署（可选）：`npx firebase login && npx firebase init hosting && npx firebase deploy`

## Firestore 规则（控制台发布）
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
