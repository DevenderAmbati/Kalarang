import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase";
import { getUserProfile } from "../services/authService";
import { AppUser } from "../types/user";

interface AuthContextType {
  firebaseUser: User | null;
  appUser: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Add a delay to allow sign-out operations to complete
      // This needs to be longer to ensure auth service sign-outs complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Re-check the current user after the delay
      const currentUser = auth.currentUser;
      
      setFirebaseUser(currentUser);

      if (currentUser) {
        try {
          // Retry logic to handle Firestore write propagation delay
          let profile = null;
          let retries = 3;
          
          while (retries > 0 && !profile) {
            try {
              profile = await getUserProfile(currentUser.uid);
              setAppUser(profile as AppUser);
              break;
            } catch (error) {
              retries--;
              if (retries > 0) {
                // Wait before retrying (increasing delay)
                await new Promise(resolve => setTimeout(resolve, 500));
              } else {
                throw error; // Throw on final retry
              }
            }
          }
        } catch (error) {
          // User is authenticated with Firebase but has no Firestore profile
          // This can happen during Google sign-in when account doesn't exist
          console.log("No user profile found in Firestore after retries");
          setAppUser(null);
          // Sign out the user if they don't have a profile
          await auth.signOut();
          setFirebaseUser(null);
        }
      } else {
        setAppUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, appUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
