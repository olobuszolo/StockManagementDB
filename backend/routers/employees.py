from fastapi import HTTPException, APIRouter
from pydantic import BaseModel
from database import get_connection

router = APIRouter(prefix="/employees", tags=["employees"])

class EmployeeCreate(BaseModel):
    name: str
    email: str

class Employee(EmployeeCreate):
    id: int

@router.get("/", response_model=list[Employee])
def get_employees():
    query = "SELECT * FROM employees"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query)
            employees = cur.fetchall()
            return employees


@router.post("/", response_model=Employee)
def create_employee(employee: EmployeeCreate):
    query = """
        INSERT INTO employees (name, email)
        VALUES (%s, %s)
        RETURNING id, name, email
        """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (employee.name, employee.email))
            new_employee = cur.fetchone()
            if new_employee is None:
                raise HTTPException(status_code=400, detail="Failed to create employee")
            return new_employee
