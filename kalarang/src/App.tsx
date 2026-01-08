import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Lottie from 'lottie-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ResetPassword from "./pages/ResetPassword";
import Upload from "./pages/Upload";
import HomeFeed from "./pages/HomeFeed";
import Discover from "./pages/Discover";
import Favourites from "./pages/Favourites";
import Portfolio from "./pages/Portfolio";
import Profile from "./pages/Profile";

import ProtectedRoute from "./routes/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";
import { logout } from "./services/authService";
import laptopDrawing from './animations/Laptop-Drawing 1.json';
import ArtistLanding from "./pages/ArtistLanding";
import BuyerLanding from "./pages/BuyerLanding";

function App() {
  const { firebaseUser, appUser, loading } = useAuth();

  // Helper function to check if user is authenticated
  const isAuthenticated = () => {
    return firebaseUser !== null && appUser !== null;
  };

  const handleLogin = () => {
    // Navigation handled by auth state change
  };

  const handleSignUp = () => {
    // Navigation handled by auth state change
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <Lottie 
          animationData={laptopDrawing} 
          loop={true}
          style={{ width: '400px', height: '400px' }}
        />
        <p style={{ 
          marginTop: '1rem', 
          fontSize: '1.2rem', 
          color: '#333',
          fontWeight: 500
        }}>
          Preparing your canvas...
        </p>
      </div>
    );
  }

  return (
    <Router>
      <SidebarProvider>
        <ToastContainer />
        <Routes>

          {/* Public routes */}
          <Route
          path="/"
          element={isAuthenticated() ? <Navigate to="/home" /> : <Home />}
        />

        <Route path="/about" element={<About />} />

        <Route
          path="/login"
          element={isAuthenticated() ? <Navigate to="/home" replace /> : <Login onLogin={handleLogin} />}
        />

        <Route
          path="/signup"
          element={isAuthenticated() ? <Navigate to="/home" /> : <SignUp onSignUp={handleSignUp} />}
        />

        <Route
          path="/reset-password"
          element={isAuthenticated() ? <Navigate to={appUser!.role === "artist" ? "/artist" : appUser!.role === "buyer" ? "/buyer" : "/dashboard"} /> : <ResetPassword />}
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout onLogout={handleLogout} pageTitle="Dashboard">
                <div style={{ padding: "2rem" }}>
                  <h1>Dashboard</h1>
                  <p>Welcome {appUser?.name}</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />

        <Route
          path="/artist"
          element={
            <ProtectedRoute>
              {appUser?.role === "artist" ? (
                <ArtistLanding />
              ) : (
                <Navigate to="/dashboard" replace />
              )}
            </ProtectedRoute>
          }
        />

        <Route
          path="/buyer"
          element={
            <ProtectedRoute>
              {appUser?.role === "buyer" ? (
                <BuyerLanding />
              ) : (
                <Navigate to="/dashboard" replace />
              )}
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-artworks"
          element={
            <ProtectedRoute>
              <Layout onLogout={handleLogout} pageTitle="My Artworks">
                <h1>🖼️ My Artworks</h1>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomeFeed />
            </ProtectedRoute>
          }
        />

        <Route
          path="/discover"
          element={
            <ProtectedRoute>
              <Discover />
            </ProtectedRoute>
          }
        />

        <Route
          path="/post"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />

        <Route
          path="/favourites"
          element={
            <ProtectedRoute>
              <Favourites />
            </ProtectedRoute>
          }
        />

        <Route
          path="/portfolio"
          element={
            <ProtectedRoute>
              <Portfolio />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Layout onLogout={handleLogout} pageTitle="Shopping Cart">
                <div style={{ padding: "2rem" }}>
                  <h1>🛒 Shopping Cart</h1>
                  <p>Your selected artworks</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

      </Routes>
      </SidebarProvider>
    </Router>
  );
}

export default App;
