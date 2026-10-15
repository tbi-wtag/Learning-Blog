import os
from dotenv import load_dotenv
from psycopg.rows import dict_row
from psycopg_pool import AsyncConnectionPool

load_dotenv()

DB_SETTINGS = {
    "host": os.getenv("POSTGRES_HOST", "localhost"),
    "port": os.getenv("POSTGRES_PORT", "5432"),
    "dbname": os.environ["POSTGRES_DB"],
    "user": os.environ["POSTGRES_USER"],
    "password": os.environ["POSTGRES_PASSWORD"],
    "row_factory": dict_row,
}

pool = AsyncConnectionPool(
    conninfo="",
    kwargs=DB_SETTINGS,
    min_size=1,
    max_size=10,
    open=False,
)


