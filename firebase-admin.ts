import { initializeApp, cert, getApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import {getStorage} from "firebase/storage";

const KEY = require('./service_key.json');

// const KEY = {
//   "type": "service_account",
//   "project_id": process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   "private_key_id": process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY_ID,
//   "private_key": process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY,
//   "client_email": process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
//   "client_id": process.env.NEXT_PUBLIC_FIREBASE_CLIENT_ID,
//   "auth_uri": "https://accounts.google.com/o/oauth2/auth",
//   "token_uri": process.env.NEXT_PUBLIC_FIREBASE_TOKEN_URI,
//   "auth_provider_x509_cert_url": process.env.NEXT_PUBLIC_FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
//   "client_x509_cert_url": process.env.NEXT_PUBLIC_FIREBASE_CLIENT_X509_CERT_URL,
//   "universe_domain": "googleapis.com"
// }


let app: App;

if (getApps().length === 0) {
  app = initializeApp({
    credential: cert(KEY)
  });
} else {
  app = getApp();
}

const adminDb = getFirestore(app);
const adminStorage = getStorage(app);
export { app as adminApp, adminDb, adminStorage };
