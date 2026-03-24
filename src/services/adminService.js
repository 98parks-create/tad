import { collection, addDoc, getDocs, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export async function requestUpgrade(uid, email, depositorName) {
  const requestsRef = collection(db, 'upgradeRequests');
  await addDoc(requestsRef, {
    uid,
    email,
    depositorName,
    status: 'pending',
    timestamp: serverTimestamp()
  });
}

export async function getUpgradeRequests() {
  const requestsRef = collection(db, 'upgradeRequests');
  const q = query(requestsRef, orderBy('timestamp', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function approveUpgrade(requestId, uid) {
  // Update request status
  const requestRef = doc(db, 'upgradeRequests', requestId);
  await updateDoc(requestRef, { status: 'approved' });
  
  // Update user profile plan
  const profileRef = doc(db, 'userProfiles', uid);
  await updateDoc(profileRef, { subscriptionPlan: 'pro' });
}
