from fastapi import HTTPException, APIRouter
from pydantic import BaseModel
from database import get_connection

router = APIRouter(prefix="/orders", tags=["orders"])

class CustomerCreate(BaseModel):
    name: str
    email: str
    nip: str

class Customer(CustomerCreate):
    id: int

@router.get("/customers", response_model=list[Customer])
def get_customers():
    query = "SELECT * FROM customers"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query)
            customers = cur.fetchall()
            return customers

@router.post("/customers", response_model=Customer)
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