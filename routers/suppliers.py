from fastapi import HTTPException, APIRouter
from pydantic import BaseModel
from database import get_connection

router = APIRouter(prefix="/suppliers", tags=["suppliers"])

class SupplierCreate(BaseModel):
    name: str
    email: str
    nip: str

class Supplier(SupplierCreate):
    id: int

class SupplierCategoryAssign(BaseModel):
    category_id: int


@router.get("/", response_model=list[Supplier])
def get_suppliers():
    query = "SELECT * FROM suppliers"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query)
            suppliers = cur.fetchall()
            return suppliers

@router.post("/", response_model=Supplier)
def create_supplier(supplier: SupplierCreate):
    query = """
        INSERT INTO suppliers (name, email, nip)
        VALUES (%s, %s, %s)
        RETURNING id, name, email, nip
        """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (supplier.name, supplier.email, supplier.nip))
            new_supplier = cur.fetchone()
            if new_supplier is None:
                raise HTTPException(status_code=400, detail="Failed to create supplier")
            return new_supplier
        

@router.post("/{supplier_id}/assign-category")
def assign_supplier_to_category(supplier_id: int, assignment: SupplierCategoryAssign):
    query = """
        INSERT INTO supplier_categories (supplier_id, category_id)
        VALUES (%s, %s)
        """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (supplier_id, assignment.category_id))
            if cur.rowcount == 0:
                raise HTTPException(status_code=400, detail="Failed to assign supplier to category")
            return {"message": "Supplier assigned to category successfully"}
        
