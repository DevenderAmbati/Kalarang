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
import CardDetail from "./pages/CardDetail";
import CreateUsername from "./pages/CreateUsername";

import ProtectedRoute from "./routes/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";
import { ThemeProvider } from "./context/ThemeContext";
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

  // Helper function to check if artist needs to create username
  const needsUsernameCreation = () => {
    return appUser?.role === "artist" && !appUser?.username;
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
    <>
      <div id="recaptcha-container"></div>
      <ThemeProvider>
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

              {/* Username creation route for artists */}
              <Route
                path="/create-username"
                element={
                  <ProtectedRoute>
                    {appUser?.role === "artist" && !appUser?.username ? (
                      <CreateUsername />
                    ) : (
                      <Navigate to={appUser?.role === "artist" ? "/artist" : "/dashboard"} replace />
                    )}
                  </ProtectedRoute>
                }
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
                    {needsUsernameCreation() ? (
                      <Navigate to="/create-username" replace />
                    ) : (
                      <Upload />
                    )}
                  </ProtectedRoute>
                }
              />

              <Route
                path="/artist"
                element={
                  <ProtectedRoute>
                    {appUser?.role === "artist" ? (
                      needsUsernameCreation() ? (
                        <Navigate to="/create-username" replace />
                      ) : (
                        <ArtistLanding />
                      )
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
                    {needsUsernameCreation() ? (
                      <Navigate to="/create-username" replace />
                    ) : (
                      <Profile />
                    )}
                  </ProtectedRoute>
                }
              />

              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    {needsUsernameCreation() ? (
                      <Navigate to="/create-username" replace />
                    ) : (
                      <HomeFeed />
                    )}
                  </ProtectedRoute>
                }
              />

              <Route
                path="/discover"
                element={
                  <ProtectedRoute>
                    {needsUsernameCreation() ? (
                      <Navigate to="/create-username" replace />
                    ) : (
                      <Discover />
                    )}
                  </ProtectedRoute>
                }
              />

              <Route
                path="/post"
                element={
                  <ProtectedRoute>
                    {needsUsernameCreation() ? (
                      <Navigate to="/create-username" replace />
                    ) : (
                      <Upload />
                    )}
                  </ProtectedRoute>
                }
              />

              <Route
                path="/favourites"
                element={
                  <ProtectedRoute>
                    {needsUsernameCreation() ? (
                      <Navigate to="/create-username" replace />
                    ) : (
                      <Favourites />
                    )}
                  </ProtectedRoute>
                }
              />

              <Route
                path="/portfolio"
                element={
                  <ProtectedRoute>
                    {needsUsernameCreation() ? (
                      <Navigate to="/create-username" replace />
                    ) : (
                      <Portfolio />
                    )}
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

              <Route
                path="/card/:id"
                element={
                  <ProtectedRoute>
                    <CardDetail />
                  </ProtectedRoute>
                }
              />

            </Routes>
          </SidebarProvider>
        </Router>
      </ThemeProvider>
    </>
  );
}

export default App;
