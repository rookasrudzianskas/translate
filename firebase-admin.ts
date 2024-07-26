import { initializeApp, cert, getApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceKey = require('./service_key.json');

let app: App;

if (getApps().length === 0) {
  app = initializeApp({
    credential: cert({
        "type": "service_account",
        "project_id": "rookas-ai-translation",
        "private_key_id": "4e40af9b88cad2455cfe5f91805b51e0af327503",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDDA6sBZ8BcqV56\n1c46vp9Tf4Aretu99oPvaMjJqhClJFjFG6dsLgNj9BfCXsN/l5cQu9KalHf0TBq1\nb+D7QnnhIYt8ZHO3uXXVFXtBHXFrZYMb1njXZFG1w71CaP0oiA+fzeWhAfpubDPQ\nb55rleqL1HnUSl09HYMFwncWIhf0G6M9xJxwiMkna/AoiJyJ+WjIy3uUeMcDjQS5\nN1jCpwfkDzMj3640r071q+VVvm2fFiL0Bs21OeUA6NabS7wZaZ6waASNWhF2J3Ki\nJpqCi6RfKoQ8ufLWCb6+UHyMUyoUsomjtx5N4zRqNE2S1WbzQt6ElyHtC61ylBdR\niQAo9jLXAgMBAAECggEASnwSqzk9BEdegk06dT6MrUA0LKdC2fYXo3AizL/Llr/g\ntfxfgJa8jcdT8dXvFsNIHEiY4pjVjjYpN2aRiHZ2BdKhq7PUbPaFtor7Zj4ALZR6\ntL3Arwgum121YnGmS/5X9WIXlF0kkVt7mN+hIxeCG8FefQKgRTEJ87+4a3g/LOlb\n6cEoNWVJ7SsH8psXnw9PUGGJ4XPM6EUyc8ZPlbbH9ByE48HzMp2qDWlGcItP4gk/\nBE+c+9AmYY7n/7EMrRSdHk/AbwNojlsiocqrp00uTpPzSCKyRbiibEil0XBQGy+w\n25G4bGg0EYrmKgqrBhN4PU5g71gPArrm4Q6ouAJ2RQKBgQD3Wvwuh0i2/+NlJ0Cs\nGoQdLHDKzPSmTtIM3kVqKrURN6xS+vk+XXZvrf8c5dh7q9tf1Y1VMqp+V6xch/wd\n+hIKl6lKuzXkEyhBqZm1PlsLXlu6eKXPK30nuJEpulfZPyvEGoX9pDcD/QnySjbo\ngVH5rG1nShBTELrrC8SvQaucIwKBgQDJ1GcjoY2ZcGrWT5reWOCett6bfzAo01lo\n0wGQykodTWMIvPWvmyjj/nC5yzFupAD+aP+GVSu9rSUp35eNKh+mRWCiR8uvvSGt\nX895gjgOpznQ+vPVMxO1hpE+hL7FUif4j7nqUdiR6fOwxyAHpkiOuWIfvqbAMK//\nWbBa4NivvQKBgQDhz9EK1Pv//EjmjlgPBcH4NBrgOQ1bSfeeQcgS7NwR1MZflri1\nQ3Oc7rZH9liURkbmDTmSPsfAwV8bthTmdOXFf8DP9Wp0RTzp/N/SwxMwpLqO2Bde\nsq/19BupgXEzZeUZiLEr5Z9H59gNtcy8o1pn2Q6jTczrWAmcDElJSWVWCwKBgQCQ\ncA5DxJjmZzo+FwgY+Xf+fZZ/p50aim4hA2jKaspxf/FQzpHw01SHHY8kl5LPwFTp\nvNCpHQjJnEDNX7NAlhXCU0IdwM22/d49CiUbqyJc8jYBJaccO4puTVhianNwGSR7\n0LfXRi179var20VD1C923JqpZzJEtlMtpcz8rI7F7QKBgQCCAYrPXUN0LFzVRDkt\nhLbNuvW8cKhDJzS/bLQ2PDTfLsL0gnqrxAUjylDRirhNB7lyXX873VhZk9TLZuQC\n86wKjXZXNgBhwx29EJa0fxMK+kD5wxHtNPGok4/FwQhTQiQSYUx/VWOQdB4cytlS\npU8/p7Ga3L4BBMtdTleRCQqRUw==\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk-dg6ln@rookas-ai-translation.iam.gserviceaccount.com",
        "client_id": "109185308575053605583",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-dg6ln%40rookas-ai-translation.iam.gserviceaccount.com",
        "universe_domain": "googleapis.com"
      }
    )
  });
} else {
  app = getApp();
}

const adminDb = getFirestore(app);

export { app as adminApp, adminDb };
