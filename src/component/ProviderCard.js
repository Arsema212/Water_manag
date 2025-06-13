import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/providerCard.css'

const ProviderCard = ({ provider, userLocation }) => {
  return (
    <Link 
      to={`/order/${provider.id}`} 
      state={{ provider }} 
      className="provider-card-link" 
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div className="provider-card">
        <h2>{provider.company_name || provider.username}</h2>
        <p>{provider.qualifications}</p>
        
        {provider.location && userLocation && (
          <p>
            Distance: {provider.distance ? `${provider.distance.toFixed(1)} km` : 'Calculating...'}
          </p>
        )}
        
        <div className="certifications">
          {provider.certifications?.length > 0 && (
            <>
              <h4>Certifications:</h4>
              <ul>
                {provider.certifications.map((cert, i) => (
                  <li key={i}>{cert}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProviderCard;
