export type ProductCreate = {
    name: string;
    description: string;
    quantity: number;
    unit_name: string;
    category_name: string;
}

export type Product = ProductCreate & {
    id: number;
}

export type ProductNewestPrice = {
    product_id: number;
    product_name: string;
    newest_price: number | null;
    delivery_id: number | null;
    delivery_order_date: string | null;
}
