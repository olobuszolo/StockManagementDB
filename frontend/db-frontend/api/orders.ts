import { API_BASE_URL } from "@/constants/url";
import { OrderCreatePayload } from "@/types/orders";

export const fetchOrders = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/`);
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};

export const fetchOrdersByCustomer = async (customerId: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${customerId}/orders-by-customer/`);
        if (!response.ok) {
            throw new Error('Failed to fetch orders for customer');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching orders for customer:', error);
        throw error;
    }
};

export async function createOrder(payload: OrderCreatePayload) {
  const response = await fetch(`${API_BASE_URL}/orders/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to create order");
  }

  return data;
}
