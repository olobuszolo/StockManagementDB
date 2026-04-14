import { BusinessEntityCreate } from '../types/customers';

const API_BASE_URL = 'http://127.0.0.1:8000';


export const fetchCustomers = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/customers/`);
        if (!response.ok) {
            throw new Error('Failed to fetch customers');
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error fetching customers:', error);
        throw error;
    }
};

export const createCustomer = async (data: BusinessEntityCreate) => {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/customers/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to create customer');
        }
        const newCustomer = await response.json();
        return newCustomer;
    } catch (error) {
        console.error('Error creating customer:', error);
        throw error;
    };
}
