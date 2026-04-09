from fastapi import HTTPException, APIRouter
from pydantic import BaseModel
from database import get_connection

router = APIRouter(prefix="/deliveries", tags=["deliveries"])

class DeliveryItemCreate(BaseModel):
    product_id: int
    quantity: float
    unit_price: float

class DeliveryItem(DeliveryItemCreate):
    id: int

class DeliveryCreate(BaseModel):
    supplier_id: int
    items: list[DeliveryItemCreate]

class Delivery(DeliveryCreate):
    id: int
    items: list[DeliveryItem]


@router.post("/", response_model=Delivery)
def create_delivery(delivery: DeliveryCreate):
    if not delivery.items:
        raise HTTPException(status_code=400, detail="Delivery must contain at least one item")
    check_supplier_query = "SELECT id FROM suppliers WHERE id = %s"
    check_product_query = "SELECT id FROM products WHERE id = %s"

    insert_delivery_query = """
        INSERT INTO deliveries (supplier_id)
        VALUES (%s)
        RETURNING id, supplier_id, status
    """
    insert_delivery_item_query = """
        INSERT INTO delivery_items (delivery_id, product_id, quantity, unit_price)
        VALUES (%s, %s, %s, %s)
        RETURNING id, product_id, quantity, unit_price
    """
    update_product_quantity_query = """
        UPDATE products
        SET quantity = quantity + %s
        WHERE id = %s
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(check_supplier_query, (delivery.supplier_id,))
            if cur.fetchone() is None:
                raise HTTPException(status_code=400, detail="Supplier not found")
            
            for item in delivery.items:
                cur.execute(check_product_query, (item.product_id,))
                if cur.fetchone() is None:
                    raise HTTPException(status_code=400, detail=f"Product with id {item.product_id} not found")
            
            cur.execute(insert_delivery_query, (delivery.supplier_id,))
            new_delivery = cur.fetchone()
            if new_delivery is None:
                raise HTTPException(status_code=400, detail="Failed to create delivery")
            
            delivery_id = new_delivery[0]
            items = []
            for item in delivery.items:
                cur.execute(insert_delivery_item_query, (delivery_id, item.product_id, item.quantity, item.unit_price))
                new_item = cur.fetchone()
                if new_item is None:
                    raise HTTPException(status_code=400, detail="Failed to create delivery item")
                items.append(new_item)
                
                cur.execute(update_product_quantity_query, (item.quantity, item.product_id))
            
            return Delivery(id=delivery_id, supplier_id=delivery.supplier_id, items=[DeliveryItem(id=item[0], product_id=item[1], quantity=item[2], unit_price=item[3]) for item in items])
    
