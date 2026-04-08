from fastapi import HTTPException, APIRouter
from pydantic import BaseModel
from database import get_connection

router = APIRouter(prefix="/products", tags=["products"])

class UnitCreate(BaseModel):
    name: str

class Unit(UnitCreate):
    id: int

class ProductCreate(BaseModel):
    name: str
    description: str
    quantity: float
    unit_id: int
    category_id: int

class Product(ProductCreate):
    id: int

@router.get("/units", response_model=list[Unit])
def get_units():
    query = "SELECT * FROM units"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query)
            units = cur.fetchall()
            return units

@router.post("/units", response_model=Unit)
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
    query = """
        INSERT INTO products (name, description, quantity, unit_id, category_id)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id, name, description, quantity, unit_id, category_id
        """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (product.name, product.description, product.quantity, product.unit_id, product.category_id))
            new_product = cur.fetchone()
            if new_product is None:
                raise HTTPException(status_code=400, detail="Failed to create product")
            return new_product
        
@router.get("/", response_model=list[Product])
def get_products():
    query = "SELECT * FROM products"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query)
            products = cur.fetchall()
            return products