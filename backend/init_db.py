from database import get_connection

def init_db():
    queries = [
        """
        CREATE TABLE IF NOT EXISTS employees (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            CHECK (email ~ '^[^@]+@[^@]+\\.[^@]+$')
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
            nip VARCHAR(10) NOT NULL UNIQUE,
            CHECK (email ~ '^[^@]+@[^@]+\\.[^@]+$')
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS supplier_categories (
            supplier_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL,
            PRIMARY KEY (supplier_id, category_id),
            FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
            FOREIGN KEY (category_id) REFERENCES categories(id)
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER NOT NULL,
            customer_id INTEGER NOT NULL,
            order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            deadline_date TIMESTAMP,
            completion_date TIMESTAMP,
            status VARCHAR(50) NOT NULL DEFAULT 'pending',
            FOREIGN KEY (employee_id) REFERENCES employees(id),
            FOREIGN KEY (customer_id) REFERENCES customers(id),
            CHECK (status IN ('pending', 'completed')),
            CHECK (deadline_date > order_date),
            CHECK (completion_date IS NULL OR completion_date > order_date)
        )
        """,
        """
        CREATE OR REPLACE FUNCTION set_deadline_date()
        RETURNS TRIGGER AS $$
        BEGIN
            IF NEW.deadline_date IS NULL THEN
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
        CREATE OR REPLACE FUNCTION set_order_status_from_completion_date()
        RETURNS TRIGGER AS $$
        BEGIN
            IF NEW.completion_date IS NOT NULL THEN
                NEW.status := 'completed';
            END IF;

            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        """,
        """
        DROP TRIGGER IF EXISTS trg_set_order_status_from_completion_date ON orders;
        CREATE TRIGGER trg_set_order_status_from_completion_date
        BEFORE INSERT OR UPDATE ON orders
        FOR EACH ROW
        EXECUTE FUNCTION set_order_status_from_completion_date();
        """,
        """
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            description VARCHAR(1000),
            quantity DECIMAL(10, 3) NOT NULL,
            unit_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL,
            FOREIGN KEY (unit_id) REFERENCES units(id),
            FOREIGN KEY (category_id) REFERENCES categories(id)
        )
        """,
        """
        CREATE OR REPLACE FUNCTION prevent_negative_product_quantity()
        RETURNS TRIGGER AS $$
        BEGIN
            IF NEW.quantity < 0 THEN
                RAISE EXCEPTION 'Negative stock for product ID %', NEW.id;
            END IF;

            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        """,
        """
        DROP TRIGGER IF EXISTS trg_prevent_negative_product_quantity ON products;
        CREATE TRIGGER trg_prevent_negative_product_quantity
        BEFORE UPDATE OF quantity ON products
        FOR EACH ROW
        EXECUTE FUNCTION prevent_negative_product_quantity();
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
            CHECK (unit_price > 0)
        )
        """,
        """
        CREATE OR REPLACE FUNCTION sync_product_stock_with_order_items()
        RETURNS TRIGGER AS $$
        BEGIN
            UPDATE products
            SET quantity = quantity - NEW.quantity
            WHERE id = NEW.product_id
            AND quantity >= NEW.quantity;

            IF NOT FOUND THEN
                RAISE EXCEPTION 'Not enough quantity for product id %', NEW.product_id;
            END IF;

            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        """,
        """
        DROP TRIGGER IF EXISTS trg_sync_product_stock_with_order_items ON order_items;
        CREATE TRIGGER trg_sync_product_stock_with_order_items
        BEFORE INSERT ON order_items
        FOR EACH ROW
        EXECUTE FUNCTION sync_product_stock_with_order_items();
        """,
        """
        CREATE TABLE IF NOT EXISTS deliveries (
            id SERIAL PRIMARY KEY,
            supplier_id INTEGER NOT NULL,
            order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            completion_date TIMESTAMP,
            status VARCHAR(50) NOT NULL DEFAULT 'pending',
            FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
            CHECK (status IN ('pending', 'completed')),
            CHECK (completion_date > order_date)
        )
        """, 
        """
        CREATE OR REPLACE FUNCTION set_delivery_status_from_completion_date()
        RETURNS TRIGGER AS $$
        BEGIN
            IF NEW.completion_date IS NOT NULL THEN
                NEW.status := 'completed';
            END IF;

            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        """,
        """
        DROP TRIGGER IF EXISTS trg_set_delivery_status_from_completion_date ON deliveries;
        CREATE TRIGGER trg_set_delivery_status_from_completion_date
        BEFORE INSERT OR UPDATE ON deliveries
        FOR EACH ROW
        EXECUTE FUNCTION set_delivery_status_from_completion_date();
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
        """,
        """
        CREATE OR REPLACE VIEW newest_product_prices_view AS
        SELECT DISTINCT ON (p.id)
            p.id AS product_id,
            p.name AS product_name,
            di.unit_price AS newest_price,
            d.id AS delivery_id,
            d.order_date AS delivery_order_date
        FROM products p
        LEFT JOIN delivery_items di ON di.product_id = p.id
        LEFT JOIN deliveries d ON d.id = di.delivery_id
        ORDER BY p.id, d.order_date DESC;
        """,
        """
        CREATE OR REPLACE VIEW incomplete_deliveries_view AS
        SELECT
            d.id,
            d.supplier_id,
            s.name AS supplier_name,
            d.order_date,
            d.completion_date,
            d.status
        FROM deliveries d
        JOIN suppliers s ON s.id = d.supplier_id
        WHERE d.status = 'pending';
        """,
        """
        CREATE OR REPLACE VIEW incomplete_orders_view AS
        SELECT
            o.id,
            o.employee_id,
            e.name AS employee_name,
            o.customer_id,
            c.name AS customer_name,
            o.order_date,
            o.deadline_date,
            o.completion_date,
            o.status
        FROM orders o
        JOIN employees e ON e.id = o.employee_id
        JOIN customers c ON c.id = o.customer_id
        WHERE o.status = 'pending';
        """,
        """
        CREATE OR REPLACE FUNCTION sync_product_stock_on_delivery_completion()
        RETURNS TRIGGER AS $$
        BEGIN
            IF OLD.status <> 'completed' AND NEW.status = 'completed' THEN
                UPDATE products p
                SET quantity = p.quantity + di.quantity
                FROM delivery_items di
                WHERE di.delivery_id = NEW.id
                  AND di.product_id = p.id;
            END IF;

            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        """,
        """
        DROP TRIGGER IF EXISTS trg_sync_product_stock_on_delivery_completion ON deliveries;
        CREATE TRIGGER trg_sync_product_stock_on_delivery_completion
        AFTER UPDATE ON deliveries
        FOR EACH ROW
        EXECUTE FUNCTION sync_product_stock_on_delivery_completion();
        """
    ]

    with get_connection() as conn:
        with conn.cursor() as cur:
            for query in queries:
                cur.execute(query)
        conn.commit()

if __name__ == "__main__":
    init_db()
