from fastapi import HTTPException, APIRouter
from pydantic import BaseModel, field_validator
from database import get_connection
from datetime import datetime

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

class DeliveryCompletionUpdate(BaseModel):
    completion_date: datetime | None = None

class Delivery(DeliveryCreate):
    id: int
    items: list[DeliveryItem]

class DeliveryResponse(BaseModel):
    supplier_name: str
    items: list[DeliveryItem]

class CompleteDeliveryItem(BaseModel):
    id: int
    product_name: str
    quantity: float
    unit_price: float

class CompleteDelivery(BaseModel):
    id: int
    supplier_name: str
    order_date: datetime
    completion_date: datetime | None = None
    status: str
    items: list[CompleteDeliveryItem]

@router.get("/", response_model=list[CompleteDelivery]) 
def get_deliveries():
    deliveries_query = """
        SELECT d.id, s.name AS supplier_name, d.order_date, d.completion_date, d.status
        FROM deliveries d
        JOIN suppliers s ON d.supplier_id = s.id
        ORDER BY d.order_date DESC
    """

    items_query = """
        SELECT di.id, p.name AS product_name, di.quantity, di.unit_price
        FROM delivery_items di
        JOIN products p ON di.product_id = p.id
        WHERE di.delivery_id = %s
        ORDER BY di.id
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(deliveries_query)
            deliveries = cur.fetchall()

            result = []

            for delivery in deliveries:
                delivery_id = delivery["id"]

                cur.execute(items_query, (delivery_id,))
                items_data = cur.fetchall()

                items = [
                    CompleteDeliveryItem(
                        id=item["id"],
                        product_name=item["product_name"],
                        quantity=item["quantity"],
                        unit_price=item["unit_price"],
                    )
                    for item in items_data
                ]

                result.append(
                    CompleteDelivery(
                        id=delivery["id"],
                        supplier_name=delivery["supplier_name"],
                        order_date=delivery["order_date"],
                        completion_date=delivery["completion_date"],
                        status=delivery["status"],
                        items=items,
                    )
                )

            return result

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
            
            delivery_id = new_delivery["id"]
            items = []
            for item in delivery.items:
                cur.execute(insert_delivery_item_query, (delivery_id, item.product_id, item.quantity, item.unit_price))
                new_item = cur.fetchone()
                if new_item is None:
                    raise HTTPException(status_code=400, detail="Failed to create delivery item")
                items.append(new_item)
            
            return Delivery(id=delivery_id, supplier_id=delivery.supplier_id, items=[DeliveryItem(id=item["id"], product_id=item["product_id"], quantity=item["quantity"], unit_price=item["unit_price"]) for item in items])

@router.put("/{delivery_id}/completion-date", response_model=CompleteDelivery)
def update_delivery_completion_date(delivery_id: int, delivery_update: DeliveryCompletionUpdate):
    completion_date = delivery_update.completion_date or datetime.now()

    update_delivery_query = """
        UPDATE deliveries
        SET completion_date = %s
        WHERE id = %s AND status = 'pending'
        RETURNING id, supplier_id, order_date, completion_date, status
    """
    supplier_query = "SELECT name FROM suppliers WHERE id = %s"
    items_query = """
        SELECT di.id, p.name AS product_name, di.quantity, di.unit_price
        FROM delivery_items di
        JOIN products p ON di.product_id = p.id
        WHERE di.delivery_id = %s
        ORDER BY di.id
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(update_delivery_query, (completion_date, delivery_id))
            updated_delivery = cur.fetchone()

            if updated_delivery is None:
                raise HTTPException(status_code=404, detail="Pending delivery not found")

            cur.execute(supplier_query, (updated_delivery["supplier_id"],))
            supplier = cur.fetchone()
            if supplier is None:
                raise HTTPException(status_code=400, detail="Supplier not found")

            cur.execute(items_query, (delivery_id,))
            items_data = cur.fetchall()

            items = [
                CompleteDeliveryItem(
                    id=item["id"],
                    product_name=item["product_name"],
                    quantity=item["quantity"],
                    unit_price=item["unit_price"],
                )
                for item in items_data
            ]

            return CompleteDelivery(
                id=updated_delivery["id"],
                supplier_name=supplier["name"],
                order_date=updated_delivery["order_date"],
                completion_date=updated_delivery["completion_date"],
                status=updated_delivery["status"],
                items=items,
            )
