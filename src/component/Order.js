import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getDistance, calculatePrice } from '../utils/calculation';
import '../styles/OrderScreen.css';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const DEFAULT_LOCATION = [9.03, 38.74];

const LocationMarker = ({ setOrderLocation, setIsValidated, setLocationError }) => {
  useMapEvents({
    click(e) {
      setOrderLocation([e.latlng.lat, e.latlng.lng]);
      setIsValidated(false);
      setLocationError('');
    },
  });
  return null;
};

const OrderScreen = ({ onOrderSubmit }) => {
  const { providerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [selectedProvider, setSelectedProvider] = useState(null);
  const [orderLocation, setOrderLocation] = useState(DEFAULT_LOCATION);
  const [address, setAddress] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [isValidated, setIsValidated] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (location.state?.provider) {
      const provider = location.state.provider;
      console.log('Received provider:', provider); // ✅ Check provider info here
      console.log('Received provider keys:', Object.keys(location.state.provider));
      console.log('Selected Provider ID:', location.state?.provider?.user_id);
      setSelectedProvider(provider);

      if (provider.lat && provider.lng) {
        setOrderLocation([provider.lat + 0.001, provider.lng + 0.001]);
      }
    }
  }, [location.state]);

  const safeOrderLocation =
    orderLocation && orderLocation.length === 2 &&
    typeof orderLocation[0] === 'number' &&
    typeof orderLocation[1] === 'number'
      ? orderLocation
      : DEFAULT_LOCATION;

  const safeProviderLocation =
    selectedProvider && selectedProvider.lat && selectedProvider.lng
      ? [selectedProvider.lat, selectedProvider.lng]
      : DEFAULT_LOCATION;

  useEffect(() => {
    if (selectedProvider) {
      const distance = getDistance(
        safeOrderLocation[0],
        safeOrderLocation[1],
        safeProviderLocation[0],
        safeProviderLocation[1]
      );
      setPrice(calculatePrice(distance, quantity));
    }
  }, [quantity, safeOrderLocation, selectedProvider]);

  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value);
    if (val >= 1 && val <= 100) setQuantity(val);
  };

  const validateOrder = () => {
    if (!orderLocation || !address.trim()) {
      setLocationError('Please select a valid delivery location and enter address');
      setIsValidated(false);
      return false;
    }
    setLocationError('');
    setIsValidated(true);
    return true;
  };

  const handleConfirmOrder = (e) => {
    e.preventDefault();
    if (validateOrder()) {
      setShowConfirmation(true);
    }
  };

  const handleFinalSubmit = async () => {
    console.log('Submitting with selectedProvider:', selectedProvider);
    try {
      const orderDetails = {
        provider_id: selectedProvider?.user_id,
        product_id: 1,
        quantity,
        total_price: price,
        delivery_address: address,
        delivery_location: safeOrderLocation,
        special_instructions: '',
        preferred_contact_method: 'phone',
      };

      console.log('Submitting Order Payload:', orderDetails); // ✅ Debugging payload

      if (!orderDetails.provider_id) {
        throw new Error('Provider ID is missing. Cannot submit order.');
      }

      setSubmitting(true);

      const response = await fetch('http://localhost:5001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderDetails)
      });

      if (!response.ok) throw new Error('Failed to submit order');

      const data = await response.json();
      alert(`Order #${data.order_id} placed successfully! Status: ${data.status}`);
      navigate('/provider-list');
    } catch (error) {
      console.error('Order submission error:', error);
      alert(`Order failed: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="order-screen">
      <h2>Place Your Water Order</h2>
      {selectedProvider ? (
        !showConfirmation ? (
          <>
            <div className="provider-info">
              <h3>Ordering from: {selectedProvider.company_name || selectedProvider.username}</h3>
              <p>Location: {selectedProvider.location || 'No address provided'}</p>
            </div>

            <MapContainer
              center={safeOrderLocation}
              zoom={13}
              style={{ height: '400px', width: '100%', borderRadius: '8px' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <LocationMarker 
                setOrderLocation={setOrderLocation}
                setIsValidated={setIsValidated}
                setLocationError={setLocationError}
              />
              <Marker position={safeProviderLocation}><Popup>Water Provider Location</Popup></Marker>
              <Marker position={safeOrderLocation}><Popup>Delivery Location</Popup></Marker>
            </MapContainer>

            <form onSubmit={handleConfirmOrder} className="order-form">
              <div className="form-group">
                <label htmlFor="address">Delivery Address</label>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter full delivery address"
                  className={locationError ? 'error' : ''}
                />
              </div>

              <div className="form-group">
                <label htmlFor="quantity">Water Quantity (liters)</label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={handleQuantityChange}
                />
              </div>

              {locationError && <p className="error-message">{locationError}</p>}

              <div className="price-summary">
                <p>Total Price: ${price.toFixed(2)}</p>
              </div>

              <button type="submit" disabled={submitting}>
                {isValidated ? 'Continue to Confirmation' : 'Validate Order'}
              </button>
            </form>
          </>
        ) : (
          <div className="confirmation-screen">
            <h3>Order Confirmation</h3>
            <div className="confirmation-details">
              <p><strong>Provider:</strong> {selectedProvider.company_name || selectedProvider.username}</p>
              <p><strong>Delivery Address:</strong> {address}</p>
              <p><strong>Quantity:</strong> {quantity} liters</p>
              <p><strong>Total Price:</strong> ${price.toFixed(2)}</p>
            </div>
            <div className="confirmation-actions">
              <button onClick={() => setShowConfirmation(false)} className="back-button">
                Back to Edit
              </button>
              <button onClick={handleFinalSubmit} className="confirm-button" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        )
      ) : (
        <p>Loading provider information...</p>
      )}
    </div>
  );
};

export default OrderScreen;
