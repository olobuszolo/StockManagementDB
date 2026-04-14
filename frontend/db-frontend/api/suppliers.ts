import { API_BASE_URL } from "@/constants/url";
import { BusinessEntityCreate } from "@/types/customers";

export const fetchSuppliers = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/suppliers/`);
        if (!response.ok) {
            throw new Error("Failed to fetch suppliers");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching suppliers:", error);
        throw error;
    }
};

export const createSupplier = async (data: BusinessEntityCreate) => {
    try {
        const response = await fetch(`${API_BASE_URL}/suppliers/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error("Failed to create supplier");
        }
        const newSupplier = await response.json();
        return newSupplier;
    } catch (error) {
        console.error("Error creating supplier:", error);
        throw error;
    }   
}

export const fetchCategoriesBySupplier = async (supplierId: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/suppliers/${supplierId}/categories/`);
        if (!response.ok) {
            throw new Error("Failed to fetch categories for supplier");
        }
        const categories = await response.json();
        return categories;
    } catch (error) {
        console.error("Error fetching categories for supplier:", error);
        throw error;
    }
}

export const assignCategoryToSupplier = async (supplierId: number, categoryId: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/suppliers/${supplierId}/assign-category/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ category_id: categoryId }),
        });
        if (!response.ok) {
            throw new Error("Failed to assign category to supplier");
        }
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error assigning category to supplier:", error);
        throw error;
    }   
}

export const fetchSuppliersWithCategories = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/deliveries/suppliers/`);
        if (!response.ok) {
            throw new Error('Failed to fetch suppliers');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        throw error;
    }   
};