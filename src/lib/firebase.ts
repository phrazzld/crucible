import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCVUidqAWZ184_WjTJ9M02qxjW1Qhgvw_I",
  authDomain: "crucible-ai.firebaseapp.com",
  projectId: "crucible-ai",
  storageBucket: "crucible-ai.appspot.com",
  messagingSenderId: "439915778756",
  appId: "1:439915778756:web:e73ef2c4f15c3388f52f91"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
