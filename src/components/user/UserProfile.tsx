import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Shape of the user profile response from the API
interface UserProfileData {
  email: string;
  [key: string]: unknown; // Allows for additional dynamic backend properties
}

export const UserProfile: React.FC = () => {
  const { secureFetch } = useAuth();
  const [profile, setProfile] = useState<UserProfileData | null>(null);

  useEffect(() => {
    const getProfileData = async () => {
      const response = await secureFetch('http://localhost:8080/api/users/profile'); 
      if (response.ok) {
        const data: UserProfileData = await response.json();
        setProfile(data);
      }
    };

    getProfileData();
  }, [secureFetch]);

  if (!profile) return <div>Loading secured content...</div>;

  return <div>Welcome back, user unique email is: {profile.email}</div>;
};