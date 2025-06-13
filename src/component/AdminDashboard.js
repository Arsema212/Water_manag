import React, { useState, useEffect } from 'react';
import "../styles/AdminDashboard.css";
import { Map } from '../Map';
import ProviderRegistration from './ProviderRegistration';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [providers, setProviders] = useState([]);
    const [consumers, setConsumers] = useState([]);
    const [activeTab, setActiveTab] = useState('register');
    const [providerData, setProviderData] = useState({
        name: '',
        phone: '',
        location: '',
        description: '',
    });

    useEffect(() => {
        // here fetch consumers and providers from the database
        fetchConsumers();
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        // place holder for fetching providers from the databse
        // const response = await fetch('/api/providers');
        // const data = await response.json();
        // setProviders(data);
    }
    const fetchConsumers = async () => {
        //a place holder for fetching consumers from the database
        // const response = await fetch('/api/consumers');
        // const data = await.response.json();
        //setConsumers(data);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProviderData({ ...providerData, [name]: value });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        // Placeholder for posting provider data to the database
        // await fetch('/api/providers', {
        //     method: 'POST',
        //     body: JSON.stringify(providerData),
        //     headers: { 'Content-Type': 'application/json' },
        // });
        setProviderData({ name: '', phone: '', location: '', description: '' });
        fetchProviders(); // Refresh provider list
    };

    const handleDeleteProvider = async (id) => {
        // Placeholder for deleting a provider from the database
        // await fetch(`/api/providers/${id}`, { method: 'DELETE' });
        fetchProviders(); // Refresh provider list
    };

    const handleUpdateProvider = (id) => {
        // Placeholder for updating provider logic
        // This could open a modal or navigate to an update form
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'register':
                return <RegisterProvider />;
            case 'manage':
                return <ManageProviders />;
            case 'transactions':
                return <ConsumerTransactions />;
            default:
                return null;
        }
    };

    return (
        <div className="admin-dashboard">
        <h1>Admin Dashboard</h1>
        <div className="tabs">
            <button 
                className={activeTab === 'register' ? 'active' : ''} 
                onClick={() => setActiveTab('register')}
            >
                Register Provider
            </button>
            <button 
                className={activeTab === 'manage' ? 'active' : ''} 
                onClick={() => setActiveTab('manage')}
            >
                Manage Providers
            </button>
            <button 
                className={activeTab === 'transactions' ? 'active' : ''} 
                onClick={() => setActiveTab('transactions')}
            >
                Consumer Transactions
            </button>
        </div>
        <div className="tab-content">
            {renderContent()}
        </div>
    </div>
);
};

// Example components for each tab
const RegisterProvider = () => (
    <ProviderRegistration />
);

const ManageProviders = () => (
<div>
    <h2>Manage Providers</h2>
    <p>List of providers goes here.</p>
</div>
);

const ConsumerTransactions = () => (
<div>
    <h2>Consumer Transactions</h2>
    <p>Transaction management details go here.</p>
</div>
);

export default AdminDashboard;