const API_BASE_URL = 'http://127.0.0.1:8000';

export type employeeCreate = {
    name: string;
    email: string;
}

export const fetchEmployees = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/employees/`);
        if (!response.ok) {
            throw new Error('Failed to fetch employees');
        }
        const employees = await response.json();
        return employees;
    } catch (error) {
        console.error('Error fetching employees:', error);
        throw error;
    }
}

export const createEmployee = async (data: employeeCreate) => {
    try {
        const response = await fetch(`${API_BASE_URL}/employees/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to create employee');
        }
        const newEmployee = await response.json();
        return newEmployee;
    } catch (error) {
        console.error('Error creating employee:', error);
        throw error;
    }
}