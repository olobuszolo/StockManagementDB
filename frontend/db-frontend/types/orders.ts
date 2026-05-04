export type OrderItemCreate = {
  product_name: string;
  quantity: number;
  unit_price: number;
};

export type OrderCreatePayload = {
  employee_id: number;
  customer_id: number;
  items: OrderItemCreate[];
};


export type OrderItem = {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  unit_name: string;
};

export type Order = {
  id: number;
  employee_name: string;
  customer_name: string;
  order_date: string;
  deadline_date: string;
  completion_date?: string | null;
  status: string;
  items: OrderItem[];
};

export type IncompleteOrder = {
  id: number;
  employee_id: number;
  employee_name: string;
  customer_id: number;
  customer_name: string;
  order_date: string;
  deadline_date: string;
  completion_date?: string | null;
  status: string;
};
