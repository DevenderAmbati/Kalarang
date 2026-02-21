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
 * Convert blob URL to File object
 */
async function blobUrlToFile(blobUrl: string, filename: string): Promise<File> {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
}

/**
 * Upload profile image (avatar or banner)
 */
export async function uploadProfileImage(
  userId: string,
  file: Blob | File | string,
  type: "avatar" | "banner"
): Promise<string> {
  const timestamp = Date.now();
  const filename = `${type}_${timestamp}.jpg`;
  const storageRef = ref(storage, `users/${userId}/${filename}`);

  // Handle blob URL (string) conversion
  let fileToUpload: Blob | File;
  if (typeof file === 'string') {
    fileToUpload = await blobUrlToFile(file, filename);
  } else {
    fileToUpload = file;
  }

  await uploadBytes(storageRef, fileToUpload);
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

/**
 * Update user banner
 */
export async function updateUserBanner(
  userId: string,
  bannerBlobUrl: string
): Promise<string> {
  // Upload banner to Firebase Storage
  const bannerUrl = await uploadProfileImage(userId, bannerBlobUrl, 'banner');
  
  // Update user document with new banner URL
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    bannerImage: bannerUrl,
    updatedAt: serverTimestamp(),
  });
  
  return bannerUrl;
}

/**
 * Update user avatar
 */
export async function updateUserAvatar(
  userId: string,
  avatarBlobUrl: string
): Promise<string> {
  // Upload avatar to Firebase Storage
  const avatarUrl = await uploadProfileImage(userId, avatarBlobUrl, 'avatar');
  
  // Update user document with new avatar URL
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    avatar: avatarUrl,
    updatedAt: serverTimestamp(),
  });
  
  return avatarUrl;
}
