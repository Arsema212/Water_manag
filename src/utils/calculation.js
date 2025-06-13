// Calculate distance between two coordinates (Haversine formula)
export function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Calculate price based on distance and quantity
export function calculatePrice(distance, quantity) {
    const basePricePerLiter = 0.5; // $0.5 per liter
    const deliveryCostPerKm = 0.2; // $0.2 per km
    
    const waterCost = basePricePerLiter * quantity;
    const deliveryCost = deliveryCostPerKm * distance;
    
    return waterCost + deliveryCost;
}