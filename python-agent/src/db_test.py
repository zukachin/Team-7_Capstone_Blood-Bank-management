import psycopg2

try:
    conn = psycopg2.connect(
        dbname="version 1",   # change if your DB name is different
        user="postgres",
        password="12345678",
        host="localhost",
        port="5432"
    )
    cursor = conn.cursor()
    cursor.execute("SELECT version();")
    record = cursor.fetchone()
    print("✅ Connected to DB, PostgreSQL version:", record)

    cursor.close()
    conn.close()
except Exception as e:
    print("❌ DB connection failed:", e)
