import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

const QUOTES_COLLECTION = 'quotes';

export const saveQuote = async (userId, quoteData, quoteId = null) => {
  try {
    if (quoteId) {
      const docRef = doc(db, QUOTES_COLLECTION, quoteId);
      await updateDoc(docRef, {
        ...quoteData,
        updatedAt: serverTimestamp()
      });
      return quoteId;
    } else {
      const docRef = await addDoc(collection(db, QUOTES_COLLECTION), {
        ...quoteData,
        userId,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    }
  } catch (error) {
    console.error("Error saving quote: ", error);
    throw error;
  }
};

export const deleteQuote = async (quoteId) => {
  try {
    const docRef = doc(db, QUOTES_COLLECTION, quoteId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting quote: ", error);
    throw error;
  }
};

export const getQuotes = async (userId) => {
  try {
    const q = query(collection(db, QUOTES_COLLECTION), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    // Sort in memory to avoid needing composite indexes in Firestore
    return docs.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error getting quotes: ", error);
    throw error;
  }
};
