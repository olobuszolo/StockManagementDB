from fastapi import HTTPException, APIRouter
from pydantic import BaseModel
from database import get_connection

router = APIRouter(prefix="/products", tags=["products"])

class CategoryCreate(BaseModel):
    name: str

class Category(CategoryCreate):
    id: int

@router.get("/categories", response_model=list[Category])
def get_categories():
    query = "SELECT * FROM categories"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query)
            categories = cur.fetchall()
            return categories

@router.post("/categories", response_model=Category)
def create_category(category: CategoryCreate):
    query = """
        INSERT INTO categories (name)
        VALUES (%s)
        RETURNING id, name
        """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (category.name,))
            new_category = cur.fetchone()
            if new_category is None:
                raise HTTPException(status_code=400, detail="Failed to create category")
            return new_category