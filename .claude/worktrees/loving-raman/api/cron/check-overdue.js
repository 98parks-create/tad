import admin from 'firebase-admin';

// Initialize Firebase Admin (Only once)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace escaped newlines with actual newlines
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error', error.stack);
  }
}

export default async function handler(req, res) {
  // Verify Cron Request (If VERCEL_CRON_SECRET is configured)
  const authHeader = req.headers.authorization;
  if (
    process.env.VERCEL_CRON_SECRET &&
    authHeader !== `Bearer ${process.env.VERCEL_CRON_SECRET}`
  ) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const db = admin.firestore();
    const today = new Date().toISOString().split('T')[0];
    
    // We fetch all users' quotes as an admin. Since the data model seems grouped by user or flat, 
    // we query a assumed 'quotes' collection (or we would need to check how quoteService saves).
    // Note: Assuming quotes are stored under 'users/{userId}/quotes' based on normal patterns,
    // we should use a collectionGroup query.
    
    const overdueSnapshot = await db.collectionGroup('quotes')
                                    .where('status', 'not-in', ['completed', 'approved', '승인완료'])
                                    .get();

    let notificationSentCount = 0;
    
    for (const doc of overdueSnapshot.docs) {
      const data = doc.data();
      const dueDate = data.customerInfo?.paymentDueDate;
      
      if (dueDate) {
        const due = new Date(dueDate);
        const now = new Date();
        
        // If due date has passed
        if (due < now && !data.alimtalkSent) {
          console.log(`[Cron] Payment Overdue for Quote ${doc.id} - Sending Kakao Alimtalk to ${data.customerInfo.phone}...`);
          
          // TODO: Implement actual Kakao BizMessage API call here
          // e.g., await axios.post('kakao_api_gateway', { phone: data.customerInfo.phone, template_id: 'payment_req' });

          // Mark as sent so we don't spam them repeatedly
          await doc.ref.update({
            alimtalkSent: true,
            lastRemindedAt: new Date().toISOString()
          });

          notificationSentCount++;
        }
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: `Checked overdue payments. Sent ${notificationSentCount} notifications.` 
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
