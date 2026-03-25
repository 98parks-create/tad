/* global process */
import admin from 'firebase-admin';

// Initialize Firebase Admin lazily in serverless function
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'tad-portfolio1';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.VITE_FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@tad-portfolio1.iam.gserviceaccount.com';
  const rawKey = process.env.FIREBASE_PRIVATE_KEY || process.env.VITE_FIREBASE_PRIVATE_KEY || process.env.PRIVATE_KEY || '';
  const privateKey = rawKey.replace(/\\n/g, '\n');

  if (!rawKey) console.error("CRITICAL: FIREBASE_PRIVATE_KEY is missing in Vercel!");

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code, redirectUri } = req.body;
  if (!code || !redirectUri) return res.status(400).json({ error: 'Missing code or redirectUri' });

  try {
    const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID || 'a943703dfa539a566422a258392aa3e9';

    // 1. Get Access Token
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: KAKAO_CLIENT_ID,
        redirect_uri: redirectUri,
        code
      })
    });
    
    const tokenData = await tokenRes.json();
    if (tokenData.error) throw new Error(tokenData.error_description || tokenData.error);
    
    const accessToken = tokenData.access_token;

    // 2. Get Kakao User Info
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      }
    });

    const userData = await userRes.json();
    if (!userData.id) throw new Error('Failed to fetch user data');

    const uid = `kakao:${userData.id}`;
    const email = userData.kakao_account?.email || `${userData.id}@kakao-user.tad`;
    const name = userData.properties?.nickname || '카카오 사용자';

    // 3. Create or Get Firebase User
    try {
      await admin.auth().getUser(uid);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        await admin.auth().createUser({
          uid,
          email,
          displayName: name,
        });
      } else {
        throw error;
      }
    }

    // 4. Issue Custom Token
    const customToken = await admin.auth().createCustomToken(uid);
    return res.status(200).json({ customToken });
    
  } catch (error) {
    console.error('Kakao Auth Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
