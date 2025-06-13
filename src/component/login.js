import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';
import PropTypes from 'prop-types';

const Login = ({ 
  setUserType,
  setCurrentUser,
  setIsAdmin, 
  setCustomerLocation, 
  setIsProviderLoggedIn, 
  setIsAuthenticated,
  setCurrentProvider 
}) => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // Add this line
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        if (e) {
            e.preventDefault();
        }
        setError('');
        console.log('Login attempt started');
        
        try {
            console.log('Sending login request...');
            const response = await fetch('http://localhost:5001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log('Login response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store token and user data
            localStorage.setItem('token', data.token);
            setIsAuthenticated(true);
            
            // Use userType from response (camelCase as per your API)
            const userType = data.userType || 'consumer'; 
            console.log('User type:', userType);
            setUserType(userType);

            if (userType === 'provider') {
                console.log('Processing provider login');
                try {
                    console.log('Fetching provider data...');
                    const providerRes = await fetch(`http://localhost:5001/api/providers`, {
                        headers: {
                            'Authorization': `Bearer ${data.token}`
                        }
                    });
                    
                    if (!providerRes.ok) {
                        console.error('Provider data fetch failed:', providerRes.status);
                        throw new Error(`Failed to fetch provider data: ${providerRes.status}`);
                    }
                    
                    const providersData = await providerRes.json();
                    console.log('Providers data received:', providersData);
                    
                    // Find the provider that matches the logged-in user's email
                    const providerData = providersData.find(p => p.email === email);
                    
                    if (!providerData) {
                        throw new Error('Provider data not found for the logged-in user');
                    }
                    
                    console.log('Found provider data:', providerData);
                    
                    // Create a complete provider object
                    const completeProviderData = {
                        ...providerData,
                        userType: 'provider',
                        email: email,
                        name: providerData.name || providerData.username,
                        companyName: providerData.company_name || providerData.companyName,
                        phone: providerData.phone,
                        address: providerData.address,
                        location: providerData.location,
                        qualifications: providerData.qualifications,
                        certifications: providerData.certifications || [],
                        serviceAreas: providerData.service_areas || providerData.serviceAreas || []
                    };
                    
                    console.log('Setting provider data:', completeProviderData);
                    
                    // Set provider data first
                    setCurrentProvider(completeProviderData);
                    // Then set provider login status
                    setIsProviderLoggedIn(true);
                    
                    // Wait a moment for state to update
                    setTimeout(() => {
                        console.log('Attempting navigation to provider profile...');
                        navigate('/provider/profile', { replace: true });
                    }, 100);
                    
                } catch (err) {
                    console.error('Error in provider login process:', err);
                    setError('Failed to load provider data. Please try again.');
                    // Clear the token since the provider data fetch failed
                    localStorage.removeItem('token');
                    setIsAuthenticated(false);
                }
            } else if (userType === 'admin') {
                console.log('Redirecting to admin dashboard');
                setIsAdmin(true);
                navigate('/admin', { replace: true });
            } else {
                console.log('Redirecting to providers list');
                setCurrentUser({
                    email: email,
                    userType: userType
                });
                navigate('/providers', { replace: true });
            }

        } catch (err) {
            console.error('Login error:', err);
            setError(err.message);
        }
    };

    Login.propTypes = {
        setUserType: PropTypes.func.isRequired,
        setIsAdmin: PropTypes.func.isRequired,
        setIsProviderLoggedIn: PropTypes.func.isRequired,
        setIsAuthenticated: PropTypes.func.isRequired,
        setCurrentUser: PropTypes.func.isRequired,
        setCustomerLocation: PropTypes.func.isRequired
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleLogin}>
                <h2>Login</h2>
                {error && <div className="error-message">{error}</div>}
                <input
                    type="text" 
                    placeholder="Username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    autoComplete="off" 
                    required
                />
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    autoComplete="off" 
                    required
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    autoComplete="off" 
                />
                <button 
                    type="submit" 
                    className="login-button"
                    onClick={(e) => {
                        e.preventDefault();
                        handleLogin(e);
                    }}
                >
                    Login
                </button>
                <p>
                    Don't have an account? <Link to="/create-account">Create one here</Link>
                </p>
            </form>
        </div>
    );
};

export default Login;