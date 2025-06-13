import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderCard from './ProviderCard';
import OrderScreen from './Order';

const ProvidersList = ({ providers, userLocation }) => {
  const navigate = useNavigate();
  const [selectedProvider, setSelectedProvider] = useState(null);

  const handleOrderSubmit = (order) => {
    console.log('Order submitted:', order);
    navigate('/order-confirmation', { state: { order } });
  };

  if (selectedProvider) {
    return (
      <OrderScreen
        selectedProvider={selectedProvider}
        onOrderSubmit={handleOrderSubmit}
      />
    );
  }

  return (
    <div className="providers-list">
      {providers.map(provider => (
        <ProviderCard
          key={provider.id}
          provider={provider}
          userLocation={userLocation}
          onClick={() => setSelectedProvider(provider)}
        />
      ))}
    </div>
  );
};

export default ProvidersList;