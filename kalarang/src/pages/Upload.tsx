import React from 'react';
import Layout from '../components/Layout';
import CreateArtwork from '../components/CreateArtwork';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';

const Upload: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <Layout onLogout={handleLogout} pageTitle="Upload Artwork">
      <CreateArtwork />
    </Layout>
  );
};

export default Upload;