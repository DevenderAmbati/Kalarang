import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  fetchSignInMethodsForEmail
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, query, collection, where, getDocs } from "firebase/firestore";
import { UserRole } from "../types/user";

export async function signup(
  name: string,
  email: string,
  password: string,
  role: UserRole
) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = userCredential.user;

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    name,
    email,
    role,
    createdAt: serverTimestamp(),
    provider: "password",
  });

  return user;
}

export async function login(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
}

export async function logout() {
  await signOut(auth);
}

export async function getUserProfile(uid: string) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error("User profile not found");
  }

  return snap.data();
}

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(defaultRole?: "artist" | "buyer") {
  let result;
  let user;
  
  try {
    result = await signInWithPopup(auth, googleProvider);
    user = result.user;

    // Check if this email already exists with a password-based account in Firestore
    if (user.email) {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", user.email), where("provider", "==", "password"));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Email exists with password provider - prevent Google login
        // Sign out immediately and wait for it to complete
        await signOut(auth);
        // Add a small delay to ensure the auth state is fully updated
        await new Promise(resolve => setTimeout(resolve, 100));
        throw new Error("ACCOUNT_EXISTS_WITH_PASSWORD");
      }
    }

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    // Login flow, but no Firestore user exists
    if (!snap.exists() && !defaultRole) {
      // Sign out the user immediately to prevent auto-creation
      await signOut(auth);
      // Add a small delay to ensure the auth state is fully updated
      await new Promise(resolve => setTimeout(resolve, 100));
      throw new Error("NO_ACCOUNT");
    }

    // Signup flow but account already exists
    if (snap.exists() && defaultRole) {
      // Sign out the user to prevent automatic login
      await signOut(auth);
      // Add a small delay to ensure the auth state is fully updated
      await new Promise(resolve => setTimeout(resolve, 100));
      throw new Error("ACCOUNT_EXISTS");
    }

    // Signup flow - create new account
    if (!snap.exists() && defaultRole) {
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName || "",
        email: user.email,
        role: defaultRole,
        createdAt: serverTimestamp(),
        provider: "google",
      });
    }

    return user;
  } catch (error: any) {
    // Check if the error is because account exists with different credential
    if (error.code === "auth/account-exists-with-different-credential") {
      // Get the email from the error
      const email = error.customData?.email || error.email;
      
      if (email) {
        try {
          // Check what sign-in methods are available for this email
          const signInMethods = await fetchSignInMethodsForEmail(auth, email);
          
          if (signInMethods.includes("password")) {
            throw new Error("ACCOUNT_EXISTS_WITH_PASSWORD");
          }
        } catch (fetchError: any) {
          // If fetchError is our custom error, re-throw it
          if (fetchError.message === "ACCOUNT_EXISTS_WITH_PASSWORD") {
            throw fetchError;
          }
          // Otherwise throw the original error
          throw error;
        }
      }
    }
    
    // Re-throw the error for other cases
    throw error;
  }
}

