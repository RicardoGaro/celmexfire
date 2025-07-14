import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBvqxM1HiNbXeD0Uip-LCYQUM_nIqPcSVE",
  authDomain: "inventariocelmx.firebaseapp.com",
  projectId: "inventariocelmx",
  storageBucket: "inventariocelmx.firebasestorage.app",
  messagingSenderId: "136733265916",
  appId: "1:136733265916:web:f81c7d6fe28d0353726c79"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };