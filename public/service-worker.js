// 极简 SW：仅做安装与立即接管
self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => self.clients.claim());

// 如果你暂时不做离线缓存，保持空实现即可，避免 404。
