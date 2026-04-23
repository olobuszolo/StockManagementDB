import { API_BASE_URL } from "@/constants/url";
import { ProductCreate } from "@/types/products";

export const fetchProducts = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/`);
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

export const fetchNewestProductPrices = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/newest-prices/`);
        if (!response.ok) {
            throw new Error('Failed to fetch newest product prices');
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error fetching newest product prices:', error);
        throw error;
    }
};

export const createProduct = async (data: ProductCreate) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to create product');
        }
        const newProduct = await response.json();
        return newProduct;
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    };
}
