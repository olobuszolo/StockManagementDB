export type OrderItem = {
    product_name: string;
    quantity: number;
    unit_name: string;
}

export type OrderCreate = {
    employee_name: string;
    customer_id: number;
    customer_name: string;
    order_date: string;
    items: OrderItem[];
}

export type Order = OrderCreate & {
    id: number;
    status: string;
    deadline_date: string;
}