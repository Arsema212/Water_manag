import React, { useState, useEffect } from 'react';
import Map from '../Map';
import '../styles/providerRegsitration.css';

const RegisterProvider = () => {
    const [providerData, setProviderData] = useState({
        username: '',
        email: '',
        phone: '',
        address: '',
        location: null, // Changed to null initially
        password: 'defaultPassword',
        user_type: 'provider'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isFetchingAddress, setIsFetchingAddress] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProviderData({ ...providerData, [name]: value });
    };

    const handlePositionChange = async (newPosition) => {
        setIsFetchingAddress(true);
        try {
            // Get address from coordinates
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${newPosition.lat}&lon=${newPosition.lng}&format=json`
            );
            const data = await response.json();
            
            setProviderData({
                ...providerData,
                address: data.display_name || 'Selected Location',
                location: { lat: newPosition.lat, lng: newPosition.lng }
            });
        } catch (error) {
            console.error('Error fetching address:', error);
            setProviderData({
                ...providerData,
                location: { lat: newPosition.lat, lng: newPosition.lng }
            });
        } finally {
            setIsFetchingAddress(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!providerData.username || !providerData.email || !providerData.phone) {
            setError('Please fill in all required fields');
            return;
        }

        const payload = {
        username: providerData.username,
        email: providerData.email,
        password: providerData.password,
        phone: providerData.phone,
        address: providerData.address,
        location: providerData.location, // { lat, lng }
        user_type: 'provider' // Explicitly set to provider
    };

        if (!providerData.location) {
            setError('Please select a location on the map');
            return;
        }

        try {
            const response = await fetch('http://localhost:5001/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Registration failed');
                return;
            }

            setSuccess('Provider registered successfully!');
            // Reset form
            setProviderData({
                username: '',
                email: '',
                phone: '',
                address: '',
                location: null,
                password: 'defaultPassword',
                user_type: 'provider'
            });
            
        } catch (err) {
            setError('Network error. Please try again.');
            console.error(err);
        }
    };

    return (
        <div className="provider-registration">
            <h2>Register New Provider</h2>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Username*</label>
                    <input
                        type="text"
                        name="username"
                        value={providerData.username}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Email*</label>
                    <input
                        type="email"
                        name="email"
                        value={providerData.email}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Phone*</label>
                    <input
                        type="tel"
                        name="phone"
                        value={providerData.phone}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Address</label>
                    <input
                        type="text"
                        name="address"
                        value={providerData.address}
                        onChange={handleInputChange}
                    />
                </div>
                 <div className="form-group">
                    <label>Location</label>
                    <div className="map-instructions">
                        <p>Click on the map to select provider location</p>
                    </div>
                    <div className="map-container">
                        <Map 
                            position={providerData.location ? [providerData.location.lat, providerData.location.lng] : null}
                            onPositionChange={handlePositionChange}
                        />
                    </div>
                    <div className="coordinates">
                        {providerData.location ? (
                            <>
                                Coordinates: {providerData.location.lat.toFixed(4)}, {providerData.location.lng.toFixed(4)}
                                <br />
                                Address: {isFetchingAddress ? 'Loading...' : providerData.address}
                            </>
                        ) : 'No location selected'}
                    </div>
                </div>
                 

                <button type="submit" className="register-button">
                    Register Provider
                </button>
            </form>
        </div>
    );
};

export default RegisterProvider;