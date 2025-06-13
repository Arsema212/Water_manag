import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProviderList from './ProviderList';
import { getDistance } from '../utils/distance';

const HomeScreen = () => {
  const [providers, setProviders] = useState([]);
  const [sortedProviders, setSortedProviders] = useState([]);
  const [location, setLocation] = useState([9.03, 38.74]); // Default to AAU
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        // 1. Get user location first
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setLocation([pos.coords.latitude, pos.coords.longitude]);
            },
            (err) => {
              console.warn('Geolocation error:', err);
              // Continue with default location
            }
          );
        }

        // 2. Fetch providers
        const { data } = await axios.get('http://localhost:5001/api/providers', {
             headers: {
             'x-auth-token': token
  }
        });
        setProviders(data);
        
        console.log(providers[0])



        // 3. Sort by distance
        if (data.length > 0 && location) {
          const withDistance = data.map(provider => ({
            ...provider,
            distance: provider.location ? 
              getDistance(location[0], location[1], provider.location[0], provider.location[1]) :
              null
          })).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
          
          setSortedProviders(withDistance);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load providers');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location]);

  if (loading) return <div className="loading">Loading providers...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="home-screen">
      <h1>Nearby Water Providers</h1>
      <ProviderList 
        providers={sortedProviders.length ? sortedProviders : providers} 
        userLocation={location} 
      />
    </div>
  );
};

export default HomeScreen;