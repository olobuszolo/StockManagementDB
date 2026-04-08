from fastapi import FastAPI
from routers.employees import router as employees_router

app = FastAPI()

app.include_router(employees_router)
