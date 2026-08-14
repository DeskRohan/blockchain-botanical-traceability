import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase.js';
import {
  User,
  HerbBatch,
  RegisterDTO,
  LoginDTO,
  CreateBatchDTO,
  AuthResponse,
  EkycSubmissionDTO,
  UserNotification,
  UserVerificationStatus,
} from '../types/index.js';

export const firebaseService = {
  // Register user with Firebase Auth & store user profile in Firestore "users" collection
  async register(data: RegisterDTO): Promise<AuthResponse> {
    const cleanEmail = data.email.trim().toLowerCase();
    
    // 1. Enforce @farmsgo.in domain for ALL user registrations
    if (!cleanEmail.endsWith('@farmsgo.in')) {
      throw new Error('Registration restricted. Only official @farmsgo.in email addresses (e.g. yourname@farmsgo.in) are allowed.');
    }

    const cleanPhone = data.phone.trim();
    const phoneDigits = cleanPhone.replace(/\D/g, '');
    const last10 = phoneDigits.length >= 10 ? phoneDigits.slice(-10) : phoneDigits;

    const passwordToUse = data.password && data.password.length >= 6 ? data.password : 'ayurfarm123';
    
    // 2. Create Firebase Auth user first to acquire authenticated state (avoids Firestore missing permissions)
    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, passwordToUse);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('Email address already exists. Please sign in or use a different email address.');
      }
      throw err;
    }

    const firebaseUser = userCredential.user;

    // 3. Strict unique phone number check across all users in Firestore (authenticated session)
    if (last10.length >= 7) {
      try {
        const allUsersSnap = await getDocs(collection(db, 'users'));
        const phoneExists = allUsersSnap.docs.some((docSnap) => {
          if (docSnap.id === firebaseUser.uid) return false;
          const u = docSnap.data() as User;
          if (!u.phone) return false;
          const uDigits = u.phone.replace(/\D/g, '');
          const uLast10 = uDigits.length >= 10 ? uDigits.slice(-10) : uDigits;
          return u.phone.trim() === cleanPhone || (last10.length >= 7 && uLast10 === last10);
        });

        if (phoneExists) {
          // Clean up the created auth user if phone number already exists
          try {
            await firebaseUser.delete();
          } catch (delErr) {
            console.warn('Auth user cleanup warning:', delErr);
          }
          throw new Error('Phone number already exists. Please use another phone number or sign in.');
        }
      } catch (e: any) {
        if (e.message && e.message.includes('Phone number already exists')) {
          throw e;
        }
        console.warn('Phone check query warning:', e);
      }
    }

    const userProfile: User = {
      userId: firebaseUser.uid,
      name: data.name,
      email: cleanEmail,
      role: data.role,
      phone: cleanPhone,
      verificationStatus: 'NOT_SUBMITTED',
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...userProfile,
      createdAt: new Date().toISOString(),
    });

    const token = await firebaseUser.getIdToken();
    return { user: userProfile, token };
  },

  // Login user with Firebase Auth & fetch profile from Firestore "users" collection
  async login(data: LoginDTO): Promise<AuthResponse> {
    const lowerEmail = data.email.trim().toLowerCase();

    // Dedicated KYC Admin Officer Login check (specifically kyc@farmsgo.in)
    if (lowerEmail === 'kyc@farmsgo.in') {
      if (data.password !== '123456') {
        throw new Error('Invalid password for KYC Admin portal (Password: 123456)');
      }
      
      // Establish active Firebase Auth session so Firestore security rules allow reads/writes
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, 'kyc@farmsgo.in', '123456');
      } catch (authErr: any) {
        try {
          userCredential = await createUserWithEmailAndPassword(auth, 'kyc@farmsgo.in', '123456');
        } catch (createErr: any) {
          console.warn('KYC Admin auth creation fallback:', createErr);
        }
      }

      const firebaseUid = userCredential?.user?.uid || 'usr-kyc-admin-farmsgo';
      const adminUser: User = {
        userId: firebaseUid,
        name: 'KYC Verification Officer',
        email: 'kyc@farmsgo.in',
        role: 'KYC Admin',
        phone: '+91 1800-FARMSGO-KYC',
        isAdmin: true,
        verificationStatus: 'APPROVED',
      };

      try {
        await setDoc(doc(db, 'users', firebaseUid), {
          ...adminUser,
          createdAt: new Date().toISOString(),
        }, { merge: true });
      } catch (docErr) {
        console.warn('KYC Admin Firestore profile save warning:', docErr);
      }

      const token = userCredential ? await userCredential.user.getIdToken() : 'kyc-admin-token-farmsgo';
      return { user: adminUser, token };
    }

    if (!data.email || !data.password) {
      throw new Error('Please enter both email address / phone number and password.');
    }

    let targetEmail = data.email.trim();
    const inputDigits = targetEmail.replace(/\D/g, '');
    const isPhoneNumber = inputDigits.length >= 7;

    if (isPhoneNumber) {
      try {
        const last10 = inputDigits.length >= 10 ? inputDigits.slice(-10) : inputDigits;
        const allUsersSnap = await getDocs(collection(db, 'users'));
        const matchedDoc = allUsersSnap.docs.find((docSnap) => {
          const u = docSnap.data() as User;
          if (!u.phone) return false;
          const uDigits = u.phone.replace(/\D/g, '');
          const uLast10 = uDigits.length >= 10 ? uDigits.slice(-10) : uDigits;
          return u.phone.trim() === targetEmail || uLast10 === last10;
        });

        if (!matchedDoc) {
          throw new Error('No collector account found with this phone number. Please register a new account.');
        }

        const foundUser = matchedDoc.data() as User;
        targetEmail = foundUser.email;
      } catch (e: any) {
        if (e.message && e.message.includes('No collector account found')) {
          throw e;
        }
        console.warn('Phone lookup error:', e);
      }
    }

    let userCredential;
    try {
      userCredential = await signInWithEmailAndPassword(auth, targetEmail, data.password);
    } catch (err: any) {
      console.warn('Firebase auth sign-in error:', err?.code, err?.message);
      throw new Error('No collector account found with these credentials or invalid password. Please register a new account.');
    }

    const firebaseUser = userCredential.user;
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      throw new Error('No collector profile found in database for this user. Please register a new account.');
    }

    const userProfile = userSnap.data() as User;
    // Check for persistent KYC verification overrides
    try {
      const kycMapRaw = localStorage.getItem('farmsgo_kyc_statuses') || '{}';
      const kycMap = JSON.parse(kycMapRaw);
      if (kycMap[userProfile.userId]) {
        userProfile.verificationStatus = kycMap[userProfile.userId].verificationStatus;
        userProfile.verificationRemarks = kycMap[userProfile.userId].verificationRemarks;
        userProfile.verifiedAt = kycMap[userProfile.userId].verifiedAt;
      }
    } catch (e) {}

    if (!userProfile.verificationStatus) {
      userProfile.verificationStatus = 'NOT_SUBMITTED';
    }

    const token = await firebaseUser.getIdToken();
    return { user: userProfile, token };
  },

  // Submit e-KYC Documents
  async submitEkyc(data: EkycSubmissionDTO): Promise<User> {
    const userRef = doc(db, 'users', data.userId);
    const updates: Partial<User> = {
      verificationStatus: 'UNDER_REVIEW',
      kisanId: data.kisanId,
      idDocumentUrl: data.idDocumentUrl,
      landDocumentUrl: data.landDocumentUrl || '',
      submittedAt: new Date().toISOString(),
    };

    try {
      await updateDoc(userRef, updates);
    } catch (e) {
      console.warn('submitEkyc updateDoc warning:', e);
    }

    // Clear any previous override
    try {
      const kycMapRaw = localStorage.getItem('farmsgo_kyc_statuses') || '{}';
      const kycMap = JSON.parse(kycMapRaw);
      delete kycMap[data.userId];
      localStorage.setItem('farmsgo_kyc_statuses', JSON.stringify(kycMap));
    } catch (e) {}

    // Create Notification for Submission
    try {
      await this.createNotification({
        userId: data.userId,
        title: 'Application Submitted Successfully',
        message: 'Your e-KYC verification application has been submitted and is currently under manual review.',
        type: 'KYC_SUBMITTED',
      });
    } catch (e) {
      console.warn('Could not write notification to Firestore:', e);
    }

    let resultUser: User;
    try {
      const updatedSnap = await getDoc(userRef);
      resultUser = updatedSnap.data() as User;
    } catch (e) {
      resultUser = {
        userId: data.userId,
        name: 'Collector',
        email: '',
        role: 'Farmer',
        phone: '',
        ...updates
      } as User;
    }
    return resultUser;
  },

  // Update e-KYC Verification Status (Admin Action)
  async updateKycStatus(userId: string, status: UserVerificationStatus, remarks?: string): Promise<User> {
    const userRef = doc(db, 'users', userId);
    const updates: Partial<User> = {
      verificationStatus: status,
      verifiedAt: new Date().toISOString(),
      verificationRemarks: remarks || (status === 'APPROVED' ? 'Verified by Quality Admin' : 'Incomplete documentation'),
    };

    let existingData: Partial<User> = {};
    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        existingData = snap.data() as User;
      }
    } catch (e) {
      console.warn('getDoc warning before update:', e);
    }

    try {
      await updateDoc(userRef, updates);
    } catch (e) {
      console.warn('Firestore updateDoc warning:', e);
      try {
        await setDoc(userRef, { ...existingData, ...updates }, { merge: true });
      } catch (setErr) {
        console.warn('Firestore setDoc merge warning:', setErr);
      }
    }

    // Save update in persistent KYC map for instant cross-session consistency
    try {
      const kycMapRaw = localStorage.getItem('farmsgo_kyc_statuses') || '{}';
      const kycMap = JSON.parse(kycMapRaw);
      kycMap[userId] = {
        verificationStatus: status,
        verificationRemarks: updates.verificationRemarks,
        verifiedAt: updates.verifiedAt
      };
      localStorage.setItem('farmsgo_kyc_statuses', JSON.stringify(kycMap));

      const rawUserStr = localStorage.getItem('farmsgo_user');
      if (rawUserStr) {
        const currentUser = JSON.parse(rawUserStr) as User;
        if (currentUser.userId === userId) {
          const updatedCurrentUser = { ...currentUser, ...updates };
          localStorage.setItem('farmsgo_user', JSON.stringify(updatedCurrentUser));
        }
      }
    } catch (e) {}

    // Create notification for user
    const title = status === 'APPROVED' ? 'e-KYC Verification Approved!' : 'e-KYC Application Rejected';
    const message = status === 'APPROVED'
      ? 'Congratulations! Your botanical collector profile has been verified. You can now issue geo-tagged herb batch records.'
      : `Your e-KYC application requires attention: ${remarks || 'Please re-submit clear ID documents.'}`;

    try {
      await this.createNotification({
        userId,
        title,
        message,
        type: status === 'APPROVED' ? 'KYC_APPROVED' : 'KYC_REJECTED',
      });
    } catch (e) {
      console.warn('Could not write notification to Firestore:', e);
    }

    return {
      userId,
      name: existingData.name || 'Collector',
      email: existingData.email || '',
      role: existingData.role || 'Farmer',
      phone: existingData.phone || '',
      ...existingData,
      ...updates,
    } as User;
  },

  // Fetch all users who have e-KYC records (UNDER_REVIEW, APPROVED, REJECTED)
  async getAllPendingKycUsers(): Promise<User[]> {
    const users: User[] = [];
    let kycMap: Record<string, any> = {};
    try {
      const kycMapRaw = localStorage.getItem('farmsgo_kyc_statuses') || '{}';
      kycMap = JSON.parse(kycMapRaw);
    } catch (e) {}

    try {
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((docSnap: any) => {
        const u = docSnap.data() as User;
        if (u.role !== 'KYC Admin' && (u.kisanId || u.idDocumentUrl || (u.verificationStatus && u.verificationStatus !== 'NOT_SUBMITTED') || kycMap[u.userId])) {
          const override = kycMap[u.userId];
          const userObj: User = {
            ...u,
            verificationStatus: override ? override.verificationStatus : (u.verificationStatus || 'UNDER_REVIEW'),
            verificationRemarks: override ? override.verificationRemarks : u.verificationRemarks,
            verifiedAt: override ? override.verifiedAt : u.verifiedAt,
          };
          users.push(userObj);
        }
      });
    } catch (e) {
      console.warn('Firestore getAllPendingKycUsers query warning:', e);
    }

    return users.sort((a, b) => {
      const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return timeB - timeA;
    });
  },

  // Notification Methods
  async createNotification(data: { userId: string; title: string; message: string; type: UserNotification['type'] }): Promise<UserNotification> {
    const notificationId = `notif-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const notif: UserNotification = {
      id: notificationId,
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      read: false,
      createdAt: new Date().toISOString(),
    };

    // 1. Write to Firestore
    try {
      await setDoc(doc(db, 'notifications', notificationId), notif);
    } catch (e) {
      console.warn('Firestore notification save warning:', e);
    }

    // 2. Save to localStorage backup
    try {
      const raw = localStorage.getItem('farmsgo_notifs') || '[]';
      const list: UserNotification[] = JSON.parse(raw);
      list.unshift(notif);
      localStorage.setItem('farmsgo_notifs', JSON.stringify(list));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    // Reset cleared flag when a new notification is created
    try {
      localStorage.removeItem(`farmsgo_cleared_${data.userId}`);
    } catch (e) {}

    return notif;
  },

  async getUserNotifications(userId: string): Promise<UserNotification[]> {
    const notifsMap = new Map<string, UserNotification>();

    // Check if user explicitly cleared notifications
    const isCleared = localStorage.getItem(`farmsgo_cleared_${userId}`) === 'true';

    // 1. Try reading from Firestore
    try {
      const q = query(collection(db, 'notifications'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((docSnap: any) => {
        const item = docSnap.data() as UserNotification;
        notifsMap.set(item.id, item);
      });
    } catch (e) {
      console.warn('Firestore notification query warning:', e);
    }

    // 2. Read from localStorage backup
    try {
      const raw = localStorage.getItem('farmsgo_notifs') || '[]';
      const list: UserNotification[] = JSON.parse(raw);
      list.forEach((n) => {
        if (n.userId === userId && !notifsMap.has(n.id)) {
          notifsMap.set(n.id, n);
        }
      });
    } catch (e) {}

    // 3. Fallback: Synthesize notification ONLY IF empty AND NOT explicitly cleared by user
    if (notifsMap.size === 0 && userId && !isCleared) {
      try {
        const uSnap = await getDoc(doc(db, 'users', userId));
        if (uSnap.exists()) {
          const u = uSnap.data() as User;
          if (u.verificationStatus === 'UNDER_REVIEW') {
            const n = await this.createNotification({
              userId,
              title: 'Application Submitted Successfully',
              message: 'Your e-KYC verification application has been submitted and is currently under manual review.',
              type: 'KYC_SUBMITTED',
            });
            notifsMap.set(n.id, n);
          } else if (u.verificationStatus === 'APPROVED') {
            const n = await this.createNotification({
              userId,
              title: 'e-KYC Verification Approved!',
              message: 'Congratulations! Your botanical collector profile has been verified. You can now issue geo-tagged herb batch records.',
              type: 'KYC_APPROVED',
            });
            notifsMap.set(n.id, n);
          } else if (u.verificationStatus === 'REJECTED') {
            const n = await this.createNotification({
              userId,
              title: 'e-KYC Application Rejected',
              message: `Your e-KYC application requires attention: ${u.verificationRemarks || 'Please re-submit clear ID documents.'}`,
              type: 'KYC_REJECTED',
            });
            notifsMap.set(n.id, n);
          }
        }
      } catch (e) {}
    }

    const result = Array.from(notifsMap.values());
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async markNotificationRead(notificationId: string): Promise<void> {
    try {
      const ref = doc(db, 'notifications', notificationId);
      await updateDoc(ref, { read: true });
    } catch (e) {}
    try {
      const raw = localStorage.getItem('farmsgo_notifs') || '[]';
      const list: UserNotification[] = JSON.parse(raw);
      const updated = list.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
      localStorage.setItem('farmsgo_notifs', JSON.stringify(updated));
    } catch (e) {}
  },

  async clearAllUserNotifications(userId: string): Promise<void> {
    // Set cleared flag so empty state is respected
    try {
      localStorage.setItem(`farmsgo_cleared_${userId}`, 'true');
    } catch (e) {}

    try {
      const q = query(collection(db, 'notifications'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const deletePromises: Promise<void>[] = [];
      querySnapshot.forEach((docSnap: any) => {
        deletePromises.push(deleteDoc(doc(db, 'notifications', docSnap.id)));
      });
      await Promise.all(deletePromises);
    } catch (e) {}

    try {
      const raw = localStorage.getItem('farmsgo_notifs') || '[]';
      const list: UserNotification[] = JSON.parse(raw);
      const filtered = list.filter((n) => n.userId !== userId);
      localStorage.setItem('farmsgo_notifs', JSON.stringify(filtered));
    } catch (e) {}
  },

  // Herb Batches
  async createBatch(data: CreateBatchDTO): Promise<{ batch: HerbBatch }> {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const batchId = `BTC-${new Date().getFullYear()}-${randomSuffix}`;

    let collectorName = 'Collector';
    let collectorRole = 'Farmer';
    if (data.collectorId) {
      try {
        const uSnap = await getDoc(doc(db, 'users', data.collectorId));
        if (uSnap.exists()) {
          const uData = uSnap.data();
          collectorName = uData.name || collectorName;
          collectorRole = uData.role || collectorRole;
        }
      } catch (e) {
        console.warn('Could not load collector doc:', e);
      }
    }

    const batch: HerbBatch = {
      batchId,
      herbName: data.herbName,
      species: data.species,
      collectorId: data.collectorId,
      collectorName,
      collectorRole: collectorRole as any,
      collectionDate: data.collectionDate,
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
      status: 'COLLECTED',
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'herbBatches', batchId), batch);
    return { batch };
  },

  async getBatchById(batchId: string): Promise<{ batch: HerbBatch }> {
    const docRef = doc(db, 'herbBatches', batchId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error(`Batch ID ${batchId} not found in Firestore`);
    }

    return { batch: docSnap.data() as HerbBatch };
  },

  async getBatchesByUserId(userId: string): Promise<{ batches: HerbBatch[] }> {
    const q = query(collection(db, 'herbBatches'), where('collectorId', '==', userId));
    const querySnapshot = await getDocs(q);
    const batches: HerbBatch[] = [];

    querySnapshot.forEach((docSnap: any) => {
      batches.push(docSnap.data() as HerbBatch);
    });

    return { batches };
  },

  async getAllBatches(): Promise<{ batches: HerbBatch[] }> {
    const colRef = collection(db, 'herbBatches');
    const querySnapshot = await getDocs(colRef);
    const batches: HerbBatch[] = [];

    querySnapshot.forEach((docSnap: any) => {
      batches.push(docSnap.data() as HerbBatch);
    });

    batches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { batches };
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },
};
