import { db } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  updateDoc,
  increment,
} from "firebase/firestore";

/**
 * Like an artwork
 */
export async function likeArtwork(userId: string, artworkId: string): Promise<void> {
  const likeRef = doc(db, "likes", `${userId}_${artworkId}`);
  await setDoc(likeRef, {
    userId,
    artworkId,
    createdAt: serverTimestamp(),
  });

  // Increment like count on artwork
  const artworkRef = doc(db, "artworks", artworkId);
  await updateDoc(artworkRef, {
    likes: increment(1),
  });
}

/**
 * Unlike an artwork
 */
export async function unlikeArtwork(userId: string, artworkId: string): Promise<void> {
  const likeRef = doc(db, "likes", `${userId}_${artworkId}`);
  await deleteDoc(likeRef);

  // Decrement like count on artwork
  const artworkRef = doc(db, "artworks", artworkId);
  await updateDoc(artworkRef, {
    likes: increment(-1),
  });
}

/**
 * Check if user has liked an artwork
 */
export async function hasLikedArtwork(
  userId: string,
  artworkId: string
): Promise<boolean> {
  const likeRef = doc(db, "likes", `${userId}_${artworkId}`);
  const likeSnap = await getDoc(likeRef);
  return likeSnap.exists();
}

/**
 * Save artwork to favorites
 */
export async function saveArtworkToFavorites(
  userId: string,
  artworkId: string
): Promise<void> {
  const favoriteRef = doc(db, "favorites", `${userId}_${artworkId}`);
  await setDoc(favoriteRef, {
    userId,
    artworkId,
    createdAt: serverTimestamp(),
  });
}

/**
 * Remove artwork from favorites
 */
export async function removeArtworkFromFavorites(
  userId: string,
  artworkId: string
): Promise<void> {
  const favoriteRef = doc(db, "favorites", `${userId}_${artworkId}`);
  await deleteDoc(favoriteRef);
}

/**
 * Check if artwork is in favorites
 */
export async function isArtworkInFavorites(
  userId: string,
  artworkId: string
): Promise<boolean> {
  const favoriteRef = doc(db, "favorites", `${userId}_${artworkId}`);
  const favoriteSnap = await getDoc(favoriteRef);
  return favoriteSnap.exists();
}

/**
 * Get user's favorite artworks IDs
 */
export async function getUserFavoriteArtworkIds(userId: string): Promise<string[]> {
  const favoritesRef = collection(db, "favorites");
  const q = query(favoritesRef, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data().artworkId);
}

/**
 * Follow an artist
 */
export async function followArtist(followerId: string, artistId: string): Promise<void> {
  const followRef = doc(db, "follows", `${followerId}_${artistId}`);
  await setDoc(followRef, {
    followerId,
    artistId,
    createdAt: serverTimestamp(),
  });
}

/**
 * Unfollow an artist
 */
export async function unfollowArtist(followerId: string, artistId: string): Promise<void> {
  const followRef = doc(db, "follows", `${followerId}_${artistId}`);
  await deleteDoc(followRef);
}

/**
 * Check if user is following an artist
 */
export async function isFollowingArtist(
  followerId: string,
  artistId: string
): Promise<boolean> {
  const followRef = doc(db, "follows", `${followerId}_${artistId}`);
  const followSnap = await getDoc(followRef);
  return followSnap.exists();
}
