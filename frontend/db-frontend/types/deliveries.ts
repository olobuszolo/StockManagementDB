export type CreateDeliveryPayload = {
    supplier_id: number;
    items: {
        product_id: number;
        quantity: number;
        unit_price: number;
    }[];
};

export type UpdateDeliveryCompletionPayload = {
    completion_date: string;
};
