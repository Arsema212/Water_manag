import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/ProviderPage.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

//Custom icons for different order statuses
const pendingIcon = new L.Icon({
  ...L.Icon.Default.prototype.options,
  iconUrl: require('../assets/marker-pending.png'),
});

const acceptedIcon = new L.Icon({
  ...L.Icon.Default.prototype.options,
  iconUrl: require('../assets/marker-accepted.png'),
});

const rejectedIcon = new L.Icon({
  ...L.Icon.Default.prototype.options,
  iconUrl: require('../assets/marker-rejected.png'),
});

const providerIcon = new L.Icon({
  ...L.Icon.Default.prototype.options,
  iconUrl: require('../assets/marker-provider.png'),
});

const OrderMap = ({ orders, providerLocation, onOrderSelect }) => {
  const map = useMap();

  // Fit map to show all markers when orders change
  useEffect(() => {
    if (orders.length > 0) {
      const bounds = L.latLngBounds(
        orders.map(order => [order.location[0], order.location[1]])
      );
      if (providerLocation) {
        bounds.extend([providerLocation[0], providerLocation[1]]);
      }
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [orders, providerLocation, map]);

  return (
    <>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {providerLocation && (
        <Marker position={providerLocation} icon={providerIcon}>
          <Popup>Your Location</Popup>
        </Marker>
      )}
      {orders.map(order => {
        let icon;
        if (order.status === 'accepted') icon = acceptedIcon;
        else if (order.status === 'rejected') icon = rejectedIcon;
        else icon = pendingIcon;

        return (
          <Marker
            key={order.id}
            position={[order.location[0], order.location[1]]}
            icon={icon}
            eventHandlers={{
              click: () => onOrderSelect(order),
            }}
          >
            <Popup>
              <div>
                <h4>Order #{order.id}</h4>
                <p>Status: {order.status}</p>
                <p>Quantity: {order.quantity} liters</p>
                <p>Price: ${order.price.toFixed(2)}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

const OrderDetails = ({ order, onAccept, onReject }) => {
  if (!order) return <div className="no-order-selected">Select an order to view details</div>;

  return (
    <div className="order-details">
      <h3>Order Details</h3>
      <div className="detail-row">
        <span className="detail-label">Order ID:</span>
        <span className="detail-value">#{order.id}</span>
      </div>
      
      <div className="customer-section">
        <h4>Customer Information</h4>
        <div className="detail-row">
          <span className="detail-label">Name:</span>
          <span className="detail-value">{order.customerName}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Phone:</span>
          <span className="detail-value">
            <a href={`tel:${order.customerPhone}`}>{order.customerPhone}</a>
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Email:</span>
          <span className="detail-value">
            <a href={`mailto:${order.customerEmail}`}>{order.customerEmail}</a>
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Preferred Contact:</span>
          <span className="detail-value">{order.preferredContactMethod || 'Phone'}</span>
        </div>
      </div>

      <div className="delivery-section">
        <h4>Delivery Information</h4>
        <div className="detail-row">
          <span className="detail-label">Address:</span>
          <span className="detail-value">{order.deliveryAddress}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Special Instructions:</span>
          <span className="detail-value">
            {order.specialInstructions || 'None provided'}
          </span>
        </div>
      </div>

      <div className="order-section">
        <h4>Order Information</h4>
        <div className="detail-row">
          <span className="detail-label">Quantity:</span>
          <span className="detail-value">{order.quantity} liters</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Total Price:</span>
          <span className="detail-value">${order.price.toFixed(2)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Order Date:</span>
          <span className="detail-value">{new Date(order.date).toLocaleString()}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Status:</span>
          <span className={`detail-value status-${order.status}`}>{order.status}</span>
        </div>
      </div>

      {order.status === 'pending' && (
        <div className="order-actions">
          <button onClick={() => onAccept(order.id)} className="accept-button">
            Accept Order
          </button>
          <button onClick={() => onReject(order.id)} className="reject-button">
            Decline Order
          </button>
        </div>
      )}

      <div className="contact-actions">
        <h4>Contact Customer</h4>
        <div className="contact-buttons">
          <a 
            href={`tel:${order.customerPhone}`} 
            className="contact-button phone"
          >
            <i className="fas fa-phone"></i> Call
          </a>
          <a 
            href={`sms:${order.customerPhone}`} 
            className="contact-button sms"
          >
            <i className="fas fa-sms"></i> SMS
          </a>
          <a 
            href={`mailto:${order.customerEmail}`} 
            className="contact-button email"
          >
            <i className="fas fa-envelope"></i> Email
          </a>
        </div>
      </div>
    </div>
  );
};

const ProviderPage = ({ provider }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const providerLocation = [provider.lat, provider.lng];

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        // In a real app, you would fetch from your backend API
        // const response = await fetch(`/api/providers/${provider.id}/orders`);
        // const data = await response.json();
        
        // Mock data for demonstration
        // Inside the useEffect where mock data is created
        const mockOrders = [
             {
                id: 1,
                customerName: 'John Doe',
                customerPhone: '+1234567890',
                customerEmail: 'john.doe@example.com',
                preferredContactMethod: 'Phone',
                deliveryAddress: '123 Main St, Cityville',
                specialInstructions: 'Ring doorbell twice',
                location: [provider.lat + 0.01, provider.lng + 0.01],
                quantity: 20,
                price: 45.50,
                date: '2023-06-15T10:30:00Z',
                status: 'pending'
            },
        {
                id: 2,
                customerName: 'Jane Smith',
                customerPhone: '+1987654321',
                customerEmail: 'jane.smith@example.com',
                preferredContactMethod: 'Email',
                deliveryAddress: '456 Oak Ave, Townsville',
                specialInstructions: 'Leave at front gate',
                location: [provider.lat - 0.015, provider.lng + 0.005],
                quantity: 15,
                price: 38.25,
                date: '2023-06-14T15:45:00Z',
                status: 'pending'
         },
  // ... other orders
    ];
        
        setOrders(mockOrders);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load orders');
        setIsLoading(false);
        console.error(err);
      }
    };

    fetchOrders();
  }, [provider.id, provider.lat, provider.lng]);

  const handleAcceptOrder = (orderId) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: 'accepted' } : order
      )
    );
    setSelectedOrder(prev => (prev && prev.id === orderId ? { ...prev, status: 'accepted' } : prev));
    // In a real app, you would also update the backend
  };

  const handleRejectOrder = (orderId) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: 'rejected' } : order
      )
    );
    setSelectedOrder(prev => (prev && prev.id === orderId ? { ...prev, status: 'rejected' } : prev));
    // In a real app, you would also update the backend
  };

  const toggleAvailability = () => {
    setIsAvailable(prev => !prev);
    // In a real app, you would update the provider's availability status in the backend
  };

  if (isLoading) return <div className="loading">Loading orders...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="provider-page">
      <div className="provider-header">
        <h2>Welcome, {provider.name}</h2>
        <div className="availability-toggle">
          <span>Availability: </span>
          <button
            onClick={toggleAvailability}
            className={`toggle-button ${isAvailable ? 'available' : 'unavailable'}`}
          >
            {isAvailable ? 'Available' : 'Unavailable'}
          </button>
        </div>
      </div>

      <div className="provider-content">
        <div className="orders-map">
          <MapContainer
            center={providerLocation}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <OrderMap
              orders={orders}
              providerLocation={providerLocation}
              onOrderSelect={setSelectedOrder}
            />
          </MapContainer>
        </div>

        <div className="orders-list">
          <h3>Orders</h3>
          <div className="order-filters">
            <button className="filter-button active">All</button>
            <button className="filter-button">Pending</button>
            <button className="filter-button">Accepted</button>
            <button className="filter-button">Rejected</button>
          </div>

          <div className="orders-container">
            {orders.length === 0 ? (
              <div className="no-orders">No orders found</div>
            ) : (
              orders.map(order => (
                <div
                  key={order.id}
                  className={`order-card ${order.status} ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="order-card-header">
                    <span className="order-id">Order #{order.id}</span>
                    <span className={`order-status ${order.status}`}>{order.status}</span>
                  </div>
                  <div className="order-card-body">
                    <div className="order-info">
                      <span className="customer-name">{order.customerName}</span>
                      <span className="order-quantity">{order.quantity} liters</span>
                    </div>
                    <div className="order-price">${order.price.toFixed(2)}</div>
                  </div>
                  <div className="order-card-footer">
                    {new Date(order.date).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="order-details-panel">
          <OrderDetails
            order={selectedOrder}
            onAccept={handleAcceptOrder}
            onReject={handleRejectOrder}
          />
        </div>
      </div>
    </div>
  );
};

export default ProviderPage;