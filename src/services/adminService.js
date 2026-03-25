import { collection, addDoc, getDocs, doc, updateDoc, serverTimestamp, query, orderBy, where } from 'firebase/firestore';
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
  const approvedAt = new Date();
  const expiresAt = new Date(approvedAt.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  // Update request status
  const requestRef = doc(db, 'upgradeRequests', requestId);
  await updateDoc(requestRef, { 
    status: 'approved',
    approvedAt: approvedAt.toISOString(),
    expiresAt: expiresAt
  });
  
  // Update user profile plan
  const profileRef = doc(db, 'userProfiles', uid);
  await updateDoc(profileRef, { 
    subscriptionPlan: 'pro',
    proExpiresAt: expiresAt
  });
}

export async function cancelUpgrade(requestId, uid) {
  // Update request status
  const requestRef = doc(db, 'upgradeRequests', requestId);
  await updateDoc(requestRef, { 
    status: 'cancelled',
    cancelledAt: new Date().toISOString()
  });
  
  // Downgrade user profile plan
  const profileRef = doc(db, 'userProfiles', uid);
  await updateDoc(profileRef, { 
    subscriptionPlan: 'free',
    proExpiresAt: null
  });
}

export async function migrateLegacyProUsers() {
  const requestsRef = collection(db, 'upgradeRequests');
  const q = query(requestsRef, where('status', '==', 'approved'));
  const snap = await getDocs(q);
  
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  let count = 0;
  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    if (!data.expiresAt) {
      await updateDoc(docSnap.ref, { 
        expiresAt: expiresAt, 
        approvedAt: data.timestamp ? new Date(data.timestamp.seconds * 1000).toISOString() : now.toISOString() 
      });
      
      const profileRef = doc(db, 'userProfiles', data.uid);
      try {
        await updateDoc(profileRef, { proExpiresAt: expiresAt, subscriptionPlan: 'pro' });
      } catch(e) { console.warn("No profile for", data.uid); }
      count++;
    }
  }
  return count;
}
