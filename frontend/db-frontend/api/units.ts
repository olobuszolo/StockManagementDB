const API_BASE_URL = 'http://127.0.0.1:8000';

export const fetchUnits = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/units/`);
        if (!response.ok) {
            throw new Error('Failed to fetch units');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching units:', error);
        throw error;
    }
};

export const createUnit = async (name: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/units/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name }),
        });
        if (!response.ok) {
            throw new Error('Failed to create unit');
        }
        const newUnit = await response.json();
        return newUnit;
    } catch (error) {
        console.error('Error creating unit:', error);
        throw error;
    }
};