import {initializeApp, getApps, getApp} from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCvVVz5NysVujXdizwepcFceOwVhWeMzAo",
  authDomain: "rookas-ai-translation.firebaseapp.com",
  projectId: "rookas-ai-translation",
  storageBucket: "rookas-ai-translation.appspot.com",
  messagingSenderId: "184141925280",
  appId: "1:184141925280:web:25eae40efb38ed50c032c5",
  measurementId: "G-XK7CJ4SZPH"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

export {db};
