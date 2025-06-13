import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../Map'

const ProfileForm = ({ userType, userData, onSave, isFirstTime }) => {
  // Initialize form state with default values
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    profilePhoto: null,
    location: userData?.location || [9.046599, 38.763332],
    // Provider-specific fields
    ...(userType === 'provider' && {
      companyName: '',
      qualifications: '',
      certifications: [],
      serviceAreas: [],
      businessLicense: null
    })
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Load existing data if editing profile
  useEffect(() => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        ...userData,
        location: userData.location || prev.location
      }));
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    // For file inputs
    if (files) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0] // Store the file object
      }));
      return;
    }
    
    // For regular inputs
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationSelect = (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      location: [lat, lng]
    }));
  };

  const handleAddCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { name: '', file: null }]
    }));
  };

  const handleCertificationChange = (index, field, value) => {
    setFormData(prev => {
      const updatedCertifications = [...prev.certifications];
      updatedCertifications[index][field] = value;
      return {
        ...prev,
        certifications: updatedCertifications
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.address) newErrors.address = 'Address is required';
    
    if (userType === 'provider') {
      if (!formData.companyName) newErrors.companyName = 'Company name is required';
      if (!formData.qualifications) newErrors.qualifications = 'Qualifications are required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // TODO: Replace with actual database integration
      // For now, we'll just call the onSave prop with the form data
      await onSave(formData);
      
      if (isFirstTime) {
        navigate('/'); // Redirect to home after first-time profile creation
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      // TODO: Handle database errors appropriately
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-form-container">
      <h2>{isFirstTime ? 'Complete Your Profile' : 'Edit Profile'}</h2>
      <form onSubmit={handleSubmit} className="profile-form">
        {/* Basic Information Section */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label>Profile Photo</label>
            <input
              type="file"
              name="profilePhoto"
              onChange={handleChange}
              accept="image/*"
            />
            {formData.profilePhoto && (
              <div className="photo-preview">
                <img 
                  src={typeof formData.profilePhoto === 'string' 
                    ? formData.profilePhoto 
                    : URL.createObjectURL(formData.profilePhoto)} 
                  alt="Profile Preview" 
                />
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label>Full Name*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>
          
          <div className="form-group">
            <label>Email*</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label>Phone Number*</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>
          
          <div className="form-group">
            <label>Address*</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
            {errors.address && <span className="error">{errors.address}</span>}
          </div>
        </div>
        
        {/* Location Section */}
        <div className="form-section">
          <h3>Location</h3>
          <div className="form-group">
            <label>Set Your Location</label>
            <div className="map-container">
              <Map 
                onLocationSelect={handleLocationSelect} 
                initialLocation={formData.location}
              />
            </div>
            <p>Selected Location: {formData.location.join(', ')}</p>
          </div>
        </div>
        
        {/* Provider-Specific Fields */}
        {userType === 'provider' && (
          <div className="form-section">
            <h3>Business Information</h3>
            
            <div className="form-group">
              <label>Company Name*</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
              {errors.companyName && <span className="error">{errors.companyName}</span>}
            </div>
            
            <div className="form-group">
              <label>Qualifications*</label>
              <textarea
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
                required
              />
              {errors.qualifications && <span className="error">{errors.qualifications}</span>}
            </div>
            
            <div className="form-group">
              <label>Business License</label>
              <input
                type="file"
                name="businessLicense"
                onChange={handleChange}
                accept=".pdf,.jpg,.png"
              />
            </div>
            
            <div className="form-group">
              <label>Certifications</label>
              {formData.certifications.map((cert, index) => (
                <div key={index} className="certification-item">
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                    placeholder="Certification name"
                  />
                  <input
                    type="file"
                    onChange={(e) => handleCertificationChange(index, 'file', e.target.files[0])}
                    accept=".pdf,.jpg,.png"
                  />
                </div>
              ))}
              <button 
                type="button" 
                onClick={handleAddCertification}
                className="add-certification"
              >
                Add Certification
              </button>
            </div>
            
            <div className="form-group">
              <label>Service Areas</label>
              <select
                multiple
                name="serviceAreas"
                value={formData.serviceAreas}
                onChange={(e) => {
                  const options = [...e.target.selectedOptions];
                  const values = options.map(option => option.value);
                  setFormData(prev => ({
                    ...prev,
                    serviceAreas: values
                  }));
                }}
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
                <option value="agricultural">Agricultural</option>
              </select>
            </div>
          </div>
        )}
        
        <div className="form-actions">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="save-button"
          >
            {isSubmitting ? 'Saving...' : 'Save Profile'}
          </button>
          {!isFirstTime && (
            <button 
              type="button" 
              onClick={() => navigate('/')}
              className="cancel-button"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;