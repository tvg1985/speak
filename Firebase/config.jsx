// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCL6R273acK82doR1zHRtBDW1Kjo9HJh9E",
    authDomain: "unlock-speak.firebaseapp.com",
    databaseURL: "https://unlock-speak-default-rtdb.firebaseio.com",
    projectId: "unlock-speak",
    storageBucket: "unlock-speak.appspot.com",
    messagingSenderId: "548362874247",
    appId: "1:548362874247:web:92a7536f04c2903868f722",
    measurementId: "G-X1Q0ZJ7315"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

isSupported().then((isSupported) => {
    if (isSupported) {
        const analytics = getAnalytics(app);
    } else {
        console.log("Firebase Analytics is not supported in this environment");
    }
});
export const db = getDatabase(app);