import admin from 'firebase-admin';

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

  const { code, state } = req.body;
  if (!code || !state) return res.status(400).json({ error: 'Missing code or state' });

  try {
    const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID || 'Hfz9nrxiGx4JoQrsxBMo';
    const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET || 'UmoEXsOt0l';
    
    // 1. Get Naver Access Token
    const tokenUrl = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${NAVER_CLIENT_ID}&client_secret=${NAVER_CLIENT_SECRET}&code=${code}&state=${state}`;

    const tokenRes = await fetch(tokenUrl, { method: 'GET' });
    const tokenData = await tokenRes.json();
    if (tokenData.error) throw new Error(tokenData.error_description || tokenData.error);
    
    const accessToken = tokenData.access_token;

    // 2. Get User Info
    const userRes = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const userData = await userRes.json();
    if (userData.resultcode !== '00') throw new Error(userData.message);

    const profile = userData.response;
    const uid = `naver:${profile.id}`;
    const email = profile.email || `${profile.id}@naver-user.tad`;
    const name = profile.name || profile.nickname || '네이버 사용자';

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
    console.error('Naver Auth Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
