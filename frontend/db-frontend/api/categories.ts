const API_BASE_URL = 'http://127.0.0.1:8000';

export const fetchCategories = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/categories/`);
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

export const createCategory = async (name: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/categories/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        });
        if (!response.ok) {
            throw new Error('Failed to create category');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
};