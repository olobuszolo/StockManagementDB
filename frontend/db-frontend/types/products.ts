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