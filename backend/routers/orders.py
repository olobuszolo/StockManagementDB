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
    product_name: str
    quantity: float
    unit_price: float

class OrderCreate(BaseModel):
    employee_id: int
    customer_id: int
    items: list[OrderItemCreate]

class CreatedOrderItemResponse(BaseModel):
    id: int
    product_name: str
    quantity: float
    unit_price: float
    unit_name: str


class CreatedOrderResponse(BaseModel):
    id: int
    employee_name: str
    customer_name: str
    order_date: datetime
    deadline_date: datetime
    status: str
    items: list[CreatedOrderItemResponse]


class OrderItemResponse(BaseModel):
    id: int
    product_name: str
    quantity: float
    unit_price: float
    unit_name: str


class OrderResponse(BaseModel):
    id: int
    employee_name: str
    customer_name: str
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
        
@router.post("/", response_model=CreatedOrderResponse)
def create_order(order: OrderCreate):
    if not order.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    check_employee_query = "SELECT id, name FROM employees WHERE id = %s"
    check_customer_query = "SELECT id, name FROM customers WHERE id = %s"
    check_product_query = """
        SELECT p.id, p.name, p.quantity, u.name AS unit_name
        FROM products p
        JOIN units u ON p.unit_id = u.id
        WHERE p.name = %s
    """

    insert_order_query = """
        INSERT INTO orders (employee_id, customer_id)
        VALUES (%s, %s)
        RETURNING id, order_date, deadline_date, status
    """

    insert_order_item_query = """
        INSERT INTO order_items (order_id, product_id, quantity, unit_price)
        VALUES (%s, %s, %s, %s)
        RETURNING id, quantity, unit_price
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
            if employee is None:
                raise HTTPException(status_code=400, detail="Employee not found")

            cur.execute(check_customer_query, (order.customer_id,))
            customer = cur.fetchone()
            if customer is None:
                raise HTTPException(status_code=400, detail="Customer not found")

            validated_products = {}

            for item in order.items:
                cur.execute(check_product_query, (item.product_name,))
                product = cur.fetchone()

                if product is None:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Product '{item.product_name}' not found"
                    )

                if product["quantity"] < item.quantity:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Not enough quantity for product '{item.product_name}'"
                    )

                validated_products[item.product_name] = product

            cur.execute(insert_order_query, (order.employee_id, order.customer_id))
            new_order = cur.fetchone()

            if new_order is None:
                raise HTTPException(status_code=400, detail="Failed to create order")

            created_items = []

            for item in order.items:
                product = validated_products[item.product_name]
                unit_price = item.unit_price

                cur.execute(
                    insert_order_item_query,
                    (new_order["id"], product["id"], item.quantity, unit_price)
                )
                new_item = cur.fetchone()

                cur.execute(update_product_quantity_query, (item.quantity, product["id"]))

                created_items.append({
                    "id": new_item["id"],
                    "product_name": product["name"],
                    "quantity": new_item["quantity"],
                    "unit_price": new_item["unit_price"],
                    "unit_name": product["unit_name"],
                })

            return {
                "id": new_order["id"],
                "employee_name": employee["name"],
                "customer_name": customer["name"],
                "order_date": new_order["order_date"],
                "deadline_date": new_order["deadline_date"],
                "status": new_order["status"],
                "items": created_items,
            }
        
@router.get("/", response_model=list[OrderResponse])
def get_orders():
    orders_query = """
        SELECT 
            o.id,
            e.name AS employee_name,
            c.name AS customer_name,
            o.order_date,
            o.deadline_date,
            o.status
        FROM orders o
        JOIN employees e ON o.employee_id = e.id
        JOIN customers c ON o.customer_id = c.id
        ORDER BY o.order_date DESC
    """

    # items_query = """
    #     SELECT 
    #         oi.id,
    #         p.name AS product_name,
    #         oi.quantity,
    #         oi.unit_price,
    #         u.name AS unit_name
    #     FROM order_items oi
    #     JOIN products p ON oi.product_id = p.id
    #     JOIN units u ON p.unit_id = u.id
    #     WHERE oi.order_id = %s
    #     ORDER BY oi.id
    # """

    items_query = """
        SELECT 
            oi.id,
            p.name AS product_name,
            oi.quantity,
            oi.unit_price,
            u.name AS unit_name
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN units u ON p.unit_id = u.id
        WHERE oi.order_id = %s
        ORDER BY oi.id
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(orders_query)
            orders_data = cur.fetchall()

            result = []

            for order in orders_data:
                order_id = order["id"]

                cur.execute(items_query, (order_id,))
                items_data = cur.fetchall()

                items = [
                    OrderItemResponse(
                        id=item["id"],
                        product_name=item["product_name"],
                        quantity=item["quantity"],
                        unit_price=item["unit_price"],
                        unit_name=item["unit_name"]
                    )
                    for item in items_data
                ]

                result.append(
                    OrderResponse(
                        id=order["id"],
                        employee_name=order["employee_name"],
                        customer_name=order["customer_name"],
                        order_date=order["order_date"],
                        deadline_date=order["deadline_date"],
                        status=order["status"],
                        items=items
                    )
                )

            return result

@router.get("/{customer_id}/orders-by-customer/", response_model=list[OrderResponse])
def get_orders_by_customer(customer_id: int):
    check_customer_query = "SELECT 1 FROM customers WHERE id = %s"

    orders_query = """
        SELECT 
            o.id,
            e.name AS employee_name,
            c.name AS customer_name,
            o.order_date,
            o.deadline_date,
            o.status
        FROM orders o
        JOIN employees e ON o.employee_id = e.id
        JOIN customers c ON o.customer_id = c.id
        WHERE o.customer_id = %s
        ORDER BY o.order_date DESC
    """

    items_query = """
        SELECT 
            oi.id,
            p.name AS product_name,
            oi.quantity,
            oi.unit_price,
            u.name AS unit_name
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN units u ON p.unit_id = u.id
        WHERE oi.order_id = %s
        ORDER BY oi.id
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(check_customer_query, (customer_id,))
            if cur.fetchone() is None:
                raise HTTPException(status_code=404, detail="Customer not found")

            cur.execute(orders_query, (customer_id,))
            orders_data = cur.fetchall()

            result = []

            for order in orders_data:
                order_id = order["id"]
                cur.execute(items_query, (order_id,))
                items_data = cur.fetchall()

                items = [
                    OrderItemResponse(
                        id=item["id"],
                        product_name=item["product_name"],
                        quantity=item["quantity"],
                        unit_price=item["unit_price"],
                        purchase_price=item["purchase_price"],
                        unit_name=item["unit_name"]
                    )
                    for item in items_data
                ]

                result.append(
                    OrderResponse(
                        id=order["id"],
                        employee_name=order["employee_name"],
                        customer_name=order["customer_name"],
                        order_date=order["order_date"],
                        deadline_date=order["deadline_date"],
                        status=order["status"],
                        items=items
                    )
                )

            return result