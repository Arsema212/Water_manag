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
    e.preventDefault();
    setError('');
    
    try {
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
        setUserType(userType);

        // Create basic user object from available data
        const user = {
            email: email,
            userType: userType,
            // Add other fields you need from data if available
            // userId: data.userId, etc.
        };

        // Redirect logic
        switch(userType) {
            case 'admin':
                setIsAdmin(true);
                navigate('/admin');
                break;
            case 'provider':
                // If you need provider details, use data.userId from token
            const providerRes = await fetch(`http://localhost:5001/api/providers/me`, {
                headers: {
                'Authorization': `Bearer ${data.token}`
                }
            });
            const providerData = await providerRes.json();
            setCurrentProvider(providerData);
            setIsProviderLoggedIn(true);
            navigate('/provider/profile');
            default: // consumer
                setCurrentUser(user);
                navigate('/providers');
        }

    } catch (err) {
        setError(err.message);
        console.error('Login error:', err);
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
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    autoComplete="off" 
                />
                <button type="submit">Login</button>
                <p>
                    Don't have an account? <Link to="/create-account">Create one here</Link>
                </p>
            </form>
        </div>
    );
};

export default Login;