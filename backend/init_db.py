from database import get_connection

def init_db():
    queries = [
        """
        CREATE TABLE IF NOT EXISTS employees (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE
            CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$')
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS customers (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            nip VARCHAR(10) NOT NULL UNIQUE
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS units (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS suppliers (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            nip VARCHAR(10) NOT NULL UNIQUE
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER NOT NULL,
            customer_id INTEGER NOT NULL,
            order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            deadline_date TIMESTAMP,
            status VARCHAR(50) NOT NULL DEFAULT 'pending',
            FOREIGN KEY (employee_id) REFERENCES employees(id),
            FOREIGN KEY (customer_id) REFERENCES customers(id),
            CHECK (status IN ('pending', 'completed', 'cancelled')),
            CHECK (deadline_date > order_date)
        )
        """,
        """
        CREATE OR REPLACE FUNCTION set_deadline_date()
        RETURNS TRIGGER AS $$
        BEGIN
            IF NEW.order_date IS NOT NULL AND NEW.deadline_date IS NULL THEN
                NEW.deadline_date := NEW.order_date + INTERVAL '7 days';
            END IF;

            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        """,
        """
        DROP TRIGGER IF EXISTS trg_set_deadline_date ON orders;
        CREATE TRIGGER trg_set_deadline_date
        BEFORE INSERT OR UPDATE ON orders
        FOR EACH ROW
        EXECUTE FUNCTION set_deadline_date();
        """,
        """
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            quantity DECIMAL(10, 3) NOT NULL,
            unit_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL,
            FOREIGN KEY (unit_id) REFERENCES units(id),
            FOREIGN KEY (category_id) REFERENCES categories(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS order_items (
            id SERIAL PRIMARY KEY,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity DECIMAL(10, 3) NOT NULL,
            unit_price DECIMAL(10, 2) NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id),
            FOREIGN KEY (product_id) REFERENCES products(id),
            CHECK (quantity > 0),
            CHECK (unit_price >= 0)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS supplier_categories (
            supplier_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL,
            PRIMARY KEY (supplier_id, category_id),
            FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
            FOREIGN KEY (category_id) REFERENCES categories(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS deliveries (
            id SERIAL PRIMARY KEY,
            supplier_id INTEGER NOT NULL,
            order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            completion_date TIMESTAMP,
            status VARCHAR(50) NOT NULL DEFAULT 'pending',
            FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
            CHECK (status IN ('pending', 'completed', 'cancelled'))
        )
        """, 
        """
        CREATE TABLE IF NOT EXISTS delivery_items (
            id SERIAL PRIMARY KEY,
            delivery_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity DECIMAL(10, 3) NOT NULL,
            unit_price DECIMAL(10, 2) NOT NULL,
            FOREIGN KEY (delivery_id) REFERENCES deliveries(id),
            FOREIGN KEY (product_id) REFERENCES products(id),
            CHECK (quantity > 0),
            CHECK (unit_price > 0)
        )
        """
    ]

    with get_connection() as conn:
        with conn.cursor() as cur:
            for query in queries:
                cur.execute(query)
        conn.commit()

if __name__ == "__main__":
    init_db()