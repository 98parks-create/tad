import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export async function getProfile(uid) {
  try {
    const profileRef = doc(db, 'userProfiles', uid);
    const profileSnap = await getDoc(profileRef);
    if (profileSnap.exists()) {
      const data = profileSnap.data();
      if (data.subscriptionPlan === 'pro' && data.proExpiresAt) {
        if (Date.now() > new Date(data.proExpiresAt).getTime()) {
          data.subscriptionPlan = 'free';
          data.proExpiresAt = null;
          try {
            await updateDoc(profileRef, { subscriptionPlan: 'free', proExpiresAt: null });
          } catch (e) {
            console.error('Failed to auto-downgrade profile', e);
          }
        }
      }
      return { id: profileSnap.id, ...data };
    }
    return null;
  } catch (error) {
    console.error("Error fetching profile: ", error);
    throw error;
  }
}

export async function saveProfile(uid, profileData) {
  try {
    const profileRef = doc(db, 'userProfiles', uid);
    await setDoc(profileRef, {
      ...profileData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving profile: ", error);
    throw error;
  }
}
