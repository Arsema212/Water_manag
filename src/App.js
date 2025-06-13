import './App.css';
import React, { useState, useEffect } from 'react';
import CreateAccount from './component/createAccount';
import Login from "./component/login";
import ProviderList from './component/ProviderList';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AdminDashboard from './component/AdminDashboard';  
import Map from './Map';
import RegisterProvider from './component/ProviderRegistration';
import ProviderPage from './component/ProviderPage';
import ProfileForm from './component/ProfileForm';
import ProfileView from './component/ProfileView';
import HomeScreen from './component/HomeScreen';
import OrderScreen from './component/Order';

function App() {
  const [customerLocation, setCustomerLocation] = useState([9.046599, 38.763332]);
  const [isAdmin, setIsAdmin] = useState(false); 
  const [isProviderLoggedIn, setIsProviderLoggedIn] = useState(false);
  const [currentProvider, setCurrentProvider] = useState(null);
  const [currentUser, setCurrentUser] = useState({
    id: null,
    name: '',
    email: ''
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState('');
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  const providers = [
    { id: 1, name: "Provider A", location: "Location A", lat: 51.51, lng: -0.1 },
    { id: 2, name: "Provider B", location: "Location B", lat: 51.49, lng: -0.08 },
    { id: 3, name: "Provider C", location: "Location C", lat: 51.5, lng: -0.09 }
  ];

  useEffect(() => {
    if (currentUser?.id) {
      const loadProfile = async () => {
        try {
          // Replace with your actual profile service call
          const profile = {}; // await profileService.getProfile(currentUser.id);
          if (!profile) {
            setIsFirstLogin(true);
          } else {
            setCurrentUser(prev => ({ ...prev, ...profile }));
          }
        } catch (error) {
          console.error('Failed to load profile:', error);
        }
      };
      loadProfile();
    }
  }, [currentUser?.id]);

  const handleProfileSave = async (profileData) => {
    try {
      const updatedUser = {
        ...currentUser,
        ...profileData
      };
      setCurrentUser(updatedUser);
      setIsFirstLogin(false);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route 
            path="/login" 
            element={
              <Login 
                setIsAdmin={setIsAdmin}
                setCustomerLocation={setCustomerLocation}
                setIsProviderLoggedIn={setIsProviderLoggedIn}
                setCurrentProvider={setCurrentProvider}
                setIsAuthenticated={setIsAuthenticated}
                setUserType={setUserType}
                setCurrentUser={setCurrentUser}
                setIsFirstLogin={setIsFirstLogin}
              />
            } 
          />
          <Route path="/provider-list" element={<providersList />} />
          <Route path="/create-account" element={<CreateAccount setCustomerLocation={setCustomerLocation} />} />
          <Route path="/providers" element={<HomeScreen />} />
          <Route 
            path="/admin" 
            element={isAdmin ? <AdminDashboard /> : <Navigate to="/login" />} 
          />
          <Route path='/register-provider' element={<RegisterProvider/>} />
          <Route 
            path="/provider" 
            element={
              isProviderLoggedIn ? 
                <ProfileView userData={currentUser} userType={userType} /> : 
                <Navigate to="/login" />
            } 
          />
          <Route 
            path="/profile" 
            element={
              isAuthenticated ? 
                <ProfileView userData={currentUser} userType={userType} /> : 
                <Navigate to="/login" />
            } 
          />
          <Route path="/order/:providerId" element={<OrderScreen />} />
          <Route 
            path="/profile/edit" 
            element={
              isAuthenticated ? 
                <ProfileForm 
                  userType={userType}
                  userData={currentUser}
                  onSave={handleProfileSave}
                  isFirstTime={isFirstLogin}
                /> : 
                <Navigate to="/login" />
            } 
          />
          <Route 
            path="/map" 
            element={
              <Map 
                onLocationSelect={(lat, lng) => {
                  console.log(`Selected Location - Lat: ${lat}, Lng: ${lng}`);
                }} 
              />
            } 
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;