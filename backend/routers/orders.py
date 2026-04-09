from fastapi import HTTPException, APIRouter
from pydantic import BaseModel
from database import get_connection
from datetime import datetime


router = APIRouter(prefix="/orders", tags=["orders"])

# Customers model
class CustomerCreate(BaseModel):
    name: str
    email: str
    nip: str

class Customer(CustomerCreate):
    id: int

#Orders model
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: float
    unit_price: float

class OrderCreate(BaseModel):
    employee_id: int
    customer_id: int
    order_date: datetime
    status: str
    items: list[OrderItemCreate]

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: float
    unit_price: float

class OrderResponse(BaseModel):
    id: int
    employee_id: int
    customer_id: int
    order_date: datetime
    deadline_date: datetime
    status: str
    items: list[OrderItemResponse]


@router.get("/customers/", response_model=list[Customer])
def get_customers():
    query = "SELECT * FROM customers"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query)
            customers = cur.fetchall()
            return customers

@router.post("/customers/", response_model=Customer)
def create_customer(customer: CustomerCreate):
    query = """
        INSERT INTO customers (name, email, nip)
        VALUES (%s, %s, %s)
        RETURNING id, name, email, nip
        """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (customer.name, customer.email, customer.nip))
            new_customer = cur.fetchone()
            if new_customer is None:
                raise HTTPException(status_code=400, detail="Failed to create customer")
            return new_customer
        
@router.post("/", response_model=OrderCreate)
def create_order(order: OrderCreate):
    if not order.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")
    
    check_employee_query = "SELECT id FROM employees WHERE id = %s"
    check_customer_query = "SELECT id FROM customers WHERE id = %s"
    check_product_query = "SELECT id, quantity FROM products WHERE id = %s"

    insert_order_query = """
        INSERT INTO orders (employee_id, customer_id, order_date, status)
        VALUES (%s, %s, %s, %s)
        RETURNING id, employee_id, customer_id, order_date, deadline_date, status

    """
    insert_order_item_query = """
        INSERT INTO order_items (order_id, product_id, quantity, unit_price)
        VALUES (%s, %s, %s, %s)
        RETURNING id, product_id, quantity, unit_price
    """
    update_product_quantity_query = """
        UPDATE products
        SET quantity = quantity - %s
        WHERE id = %s
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(check_employee_query, (order.employee_id,))
            employee = cur.fetchone()
            # Check if employee, customer and products exist
            if employee is None:
                raise HTTPException(status_code=400, detail="Employee not found")
            
            cur.execute(check_customer_query, (order.customer_id,))
            customer = cur.fetchone()
            if customer is None:
                raise HTTPException(status_code=400, detail="Customer not found")
            
            created_items = []
            for item in order.items:
                cur.execute(check_product_query, (item.product_id,))
                product = cur.fetchone()
                if product is None:
                    raise HTTPException(status_code=400, detail=f"Product with id {item.product_id} not found")
                
                if product["quantity"] < item.quantity:
                    raise HTTPException(status_code=400, detail=f"Not enough quantity for product with id {item.product_id}")
            
            # Insert order

            cur.execute(insert_order_query, (order.employee_id, order.customer_id, order.order_date, order.status))
            new_order = cur.fetchone()
            if new_order is None:
                raise HTTPException(status_code=400, detail="Failed to create order")
            
            for item in order.items:
                cur.execute(insert_order_item_query, (new_order["id"], item.product_id, item.quantity, item.unit_price))
                new_item = cur.fetchone()
                if new_item is None:
                    raise HTTPException(status_code=400, detail="Failed to create order item")
                
                cur.execute(update_product_quantity_query, (item.quantity, item.product_id))
                created_items.append(new_item)
            
            return {
                "employee_id": new_order["employee_id"],
                "customer_id": new_order["customer_id"],
                "order_date": new_order["order_date"],
                "status": new_order["status"],
                "items": created_items
            }
        
@router.get("/", response_model=list[OrderResponse])
def get_orders():
    query = """
        SELECT * FROM orders
        """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query)
            orders = cur.fetchall()
            return orders
