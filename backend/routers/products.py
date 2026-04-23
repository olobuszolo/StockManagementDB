from fastapi import HTTPException, APIRouter
from pydantic import BaseModel
from database import get_connection
from datetime import datetime

router = APIRouter(prefix="/products", tags=["products"])

class UnitCreate(BaseModel):
    name: str

class Unit(UnitCreate):
    id: int

class ProductCreate(BaseModel):
    name: str
    description: str
    quantity: float
    unit_name: str
    category_name: str

class Product(ProductCreate):
    id: int

class ProductNewestPrice(BaseModel):
    product_id: int
    product_name: str
    newest_price: float | None = None
    delivery_id: int | None = None
    delivery_order_date: datetime | None = None

@router.get("/units/", response_model=list[Unit])
def get_units():
    query = "SELECT * FROM units"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query)
            units = cur.fetchall()
            return units

@router.post("/units/", response_model=Unit)
def create_unit(unit: UnitCreate):
    query = """
        INSERT INTO units (name)
        VALUES (%s)
        RETURNING id, name
        """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (unit.name,))
            new_unit = cur.fetchone()
            if new_unit is None:
                raise HTTPException(status_code=400, detail="Failed to create unit")
            return new_unit
        
@router.post("/", response_model=Product)
def create_product(product: ProductCreate):
    unit_query = "SELECT id FROM units WHERE name = %s"
    category_query = "SELECT id FROM categories WHERE name = %s"

    insert_query = """
        INSERT INTO products (name, description, quantity, unit_id, category_id)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id
    """

    select_query = """
        SELECT
            p.id,
            p.name,
            p.description,
            p.quantity,
            u.name AS unit_name,
            c.name AS category_name
        FROM products p
        JOIN units u ON p.unit_id = u.id
        JOIN categories c ON p.category_id = c.id
        WHERE p.id = %s
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(unit_query, (product.unit_name,))
            unit_result = cur.fetchone()
            if unit_result is None:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unit '{product.unit_name}' not found"
                )
            unit_id = unit_result["id"]

            cur.execute(category_query, (product.category_name,))
            category_result = cur.fetchone()
            if category_result is None:
                raise HTTPException(
                    status_code=400,
                    detail=f"Category '{product.category_name}' not found"
                )
            category_id = category_result["id"]

            cur.execute(
                insert_query,
                (product.name, product.description, product.quantity, unit_id, category_id)
            )
            inserted_product = cur.fetchone()
            if inserted_product is None:
                raise HTTPException(status_code=400, detail="Failed to create product")

            product_id = inserted_product["id"]

            cur.execute(select_query, (product_id,))
            new_product = cur.fetchone()
            if new_product is None:
                raise HTTPException(status_code=400, detail="Failed to fetch created product")

            return new_product

@router.get("/newest-prices/", response_model=list[ProductNewestPrice])
def get_newest_product_prices():
    query = """
        SELECT *
        FROM newest_product_prices_view
        ORDER BY product_name
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query)
            prices = cur.fetchall()
            return prices

@router.get("/", response_model=list[Product])
def get_products():
    query = """
        SELECT
            p.id,
            p.name,
            p.description,
            p.quantity,
            u.name AS unit_name,
            c.name AS category_name
        FROM products p
        JOIN units u ON p.unit_id = u.id
        JOIN categories c ON p.category_id = c.id
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query)
            products = cur.fetchall()
            return products
        
