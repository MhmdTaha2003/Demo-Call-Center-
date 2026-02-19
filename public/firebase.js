// تهيئة Firebase باستخدام config تبعك
const firebaseConfig = {
  apiKey: "AIzaSyAAbJEVTgJ-TJPoc4QnfObtSo2t0KUXhN8",
  authDomain: "callcentersystem-44497.firebaseapp.com",
  databaseURL: "https://callcentersystem-44497-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "callcentersystem-44497",
  storageBucket: "callcentersystem-44497.firebasestorage.app",
  messagingSenderId: "30823294282",
  appId: "1:30823294282:web:c56a80bb0993ba5d448db3"
};

firebase.initializeApp(firebaseConfig);

// Database + Storage
const db = firebase.database();
const storage = firebase.storage();

// 🚀 حل مشكلة عدم عمل Firebase على بيانات الهاتف
// Force Firebase to use Long Polling instead of WebSockets
firebase.database.INTERNAL.forceLongPolling();
