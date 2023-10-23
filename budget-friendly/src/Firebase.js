import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import "firebase/compat/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const app = firebase.initializeApp({
  apiKey: "AIzaSyA30GLh1drEpR7UsTIQgRWRPh2bJ_i4xHw",
  authDomain: "budgetfriendly-23.firebaseapp.com",
  projectId: "budgetfriendly-23",
  storageBucket: "budgetfriendly-23.appspot.com",
  messagingSenderId: "985136649771",
  appId: "1:985136649771:web:e882c34c779987e43e7c6e",
  measurementId: "G-GNP6XY4FWL",
});

// Initialize Firebase
// export const analytics = app.analytics();
export const auth = app.auth();
export const firestore = app.firestore();
export const storage = app.storage();
