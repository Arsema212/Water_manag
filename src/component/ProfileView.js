import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/ProfileView.css'

const ProfileView = ({ userData, userType }) => {
  return (
    <div className="profile-view">
      <div className="profile-header">
        <div className="profile-photo">
          {userData.profilePhoto ? (
            <img 
              src={typeof userData.profilePhoto === 'string' 
                ? userData.profilePhoto 
                : URL.createObjectURL(userData.profilePhoto)} 
              alt="Profile" 
            />
          ) : (
            <div className="default-photo">No Photo</div>
          )}
        </div>
        <div className="profile-info">
          <h2>{userData.name}</h2>
          {userType === 'provider' && <h3>{userData.companyName}</h3>}
          <p>{userData.email}</p>
          <p>{userData.phone}</p>
          <Link to="/profile/edit" className="edit-button">Edit Profile</Link>
        </div>
      </div>

      <div className="profile-details">
        <div className="detail-section">
          <h3>Contact Information</h3>
          <p><strong>Address:</strong> {userData.address}</p>
          <p><strong>Location:</strong> {userData.location?.join(', ')}</p>
        </div>

        {userType === 'provider' && (
          <div className="detail-section">
            <h3>Business Information</h3>
            <p><strong>Qualifications:</strong> {userData.qualifications}</p>
            
            {userData.certifications?.length > 0 && (
              <div className="certifications">
                <h4>Certifications:</h4>
                <ul>
                  {userData.certifications.map((cert, index) => (
                    <li key={index}>{cert.name}</li>
                  ))}
                </ul>
              </div>
            )}

            {userData.serviceAreas?.length > 0 && (
              <div className="service-areas">
                <h4>Service Areas:</h4>
                <ul>
                  {userData.serviceAreas.map((area, index) => (
                    <li key={index}>{area}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;