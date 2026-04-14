import  { API_BASE_URL } from "@/constants/url";
import { CreateDeliveryPayload } from "@/types/deliveries";

export const fetchDeliveries = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/deliveries/`);
        if (!response.ok) {
            throw new Error('Failed to fetch deliveries');
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error fetching deliveries:', error);
        throw error;
    }
};

export const createDelivery = async (payload: CreateDeliveryPayload) => {
    const response = await fetch(`${API_BASE_URL}/deliveries/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error('Failed to create delivery');
    }
    const data = await response.json();
    return data;
};

