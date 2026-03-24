import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export async function getProfile(uid) {
  try {
    const profileRef = doc(db, 'userProfiles', uid);
    const profileSnap = await getDoc(profileRef);
    if (profileSnap.exists()) {
      return { id: profileSnap.id, ...profileSnap.data() };
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
