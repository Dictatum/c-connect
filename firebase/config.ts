import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCK-qzYZUP_LI3YE0xGND4kjbsJNXrw4Yw",
  authDomain: "campbull-ea8ae.firebaseapp.com",
  projectId: "campbull-ea8ae",
  storageBucket: "campbull-ea8ae.firebasestorage.app",
  messagingSenderId: "311962276262",
  appId: "1:311962276262:web:d2ae38386eea91f61fff67",
  measurementId: "G-YT918DN8D2",
}

console.log("Initializing Firebase...")

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

console.log("Firebase initialized successfully")

export default app
