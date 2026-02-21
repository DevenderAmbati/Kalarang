export type UserRole = "artist" | "buyer";

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  username?: string; // Optional username field for artists
  avatar?: string; // Profile avatar URL
  bannerImage?: string; // Profile banner URL
  createdAt: Date;
  provider: "password" | "google";
}
