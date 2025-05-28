// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCYjCBJB0nhpt7YbhzdEzxW0u5Msy1C468",
  authDomain: "fir-activity1-b4bd7.firebaseapp.com",
  projectId: "fir-activity1-b4bd7",
  storageBucket: "fir-activity1-b4bd7.firebasestorage.app",
  messagingSenderId: "966690100920",
  appId: "1:966690100920:web:084c1411672d720146864d",
  measurementId: "G-31GBVSWY3J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
