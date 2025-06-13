import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProviderProfile = ({ provider }) => {
  const navigate = useNavigate();

  return (
    <div className="provider-profile">
      <h2>Welcome, {provider.company_name || provider.username}</h2>
      
      <div className="profile-actions">
        <button 
          onClick={() => navigate('/provider/orders')}
          className="orders-button"
        >
          View My Orders
        </button>
        
        <button 
          onClick={() => navigate('/provider/edit')}
          className="edit-button"
        >
          Edit Profile
        </button>
      </div>
      
      <div className="profile-info">
        <h3>Profile Information</h3>
        <p><strong>Email:</strong> {provider.email}</p>
        <p><strong>Phone:</strong> {provider.phone}</p>
        <p><strong>Location:</strong> {provider.location}</p>
        {provider.qualifications && (
          <p><strong>Qualifications:</strong> {provider.qualifications}</p>
        )}
      </div>
    </div>
  );
};

export default ProviderProfile;