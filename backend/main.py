from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.employees import router as employees_router
from routers.products import router as products_router
from routers.categories import router as categories_router
from routers.orders import router as orders_router
from routers.suppliers import router as suppliers_router
from routers.deliveries import router as deliveries_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employees_router)
app.include_router(products_router)
app.include_router(categories_router)
app.include_router(orders_router)
app.include_router(suppliers_router)
app.include_router(deliveries_router)

