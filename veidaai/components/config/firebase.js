import {initializeApp} from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyBLW8up2EqwBjj8GKChCNDHGn5bcaDxG2Y",
    authDomain: "veida-3e87e.firebaseapp.com",
    projectId: "veida-3e87e",
    storageBucket: "veida-3e87e.appspot.com",
    messagingSenderId: "406627053513",
    appId: "1:406627053513:web:0e92d3becfb088058b4218"
  };

  const app = initializeApp(firebaseConfig);
  const messaging = getMessaging(app);

  export {messaging, getToken, onMessage};

  