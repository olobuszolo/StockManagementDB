import  { API_BASE_URL } from "@/constants/url";
import { CreateDeliveryPayload, UpdateDeliveryCompletionPayload } from "@/types/deliveries";

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
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.detail || 'Failed to create delivery');
    }
    return data;
};

export const updateDeliveryCompletionDate = async (
    deliveryId: number,
    payload: UpdateDeliveryCompletionPayload
) => {
    const response = await fetch(`${API_BASE_URL}/deliveries/${deliveryId}/completion-date`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.detail || 'Failed to update delivery completion date');
    }
    return data;
};

