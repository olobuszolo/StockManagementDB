import psycopg
from psycopg.rows import dict_row

DATABASE_URL = "postgresql://postgres:admin@127.0.0.1:5432/stock-management-db"


def get_connection():
    return psycopg.connect(DATABASE_URL, row_factory=dict_row)