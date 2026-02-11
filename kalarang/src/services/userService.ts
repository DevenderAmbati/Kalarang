import { db, storage } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { AppUser } from "../types/user";

export interface UserProfile extends AppUser {
  bio?: string;
  avatar?: string;
  bannerImage?: string;
  artStyle?: string[];
  philosophy?: string;
  achievements?: string[];
  exhibitions?: { year: string; title: string }[];
  education?: string[];
  commissionStatus?: "Open" | "Closed";
  commissionDescription?: string;
  commissionCtaText?: string;
  links?: { label: string; url: string; icon: string }[];
  stats?: {
    followers: number;
    artworks: number;
    following: number;
  };
}

/**
 * Upload profile image (avatar or banner)
 */
export async function uploadProfileImage(
  userId: string,
  file: Blob,
  type: "avatar" | "banner"
): Promise<string> {
  const timestamp = Date.now();
  const filename = `${type}_${timestamp}`;
  const storageRef = ref(storage, `users/${userId}/${filename}`);

  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}

/**
 * Get user profile with extended data
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  const data = userSnap.data();
  return {
    uid: userSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
  } as UserProfile;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Check if username is available
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", "==", username));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty;
}

/**
 * Update username
 */
export async function updateUsername(userId: string, username: string): Promise<void> {
  const available = await isUsernameAvailable(username);
  if (!available) {
    throw new Error("Username already taken");
  }

  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    username,
    updatedAt: serverTimestamp(),
  });
}
