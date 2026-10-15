from fastapi import APIRouter, Depends, HTTPException, status

from app.database import pool
from app.schemas import ResourceCreate, ResourceUpdate, ResourceOut
from app.auth import get_current_user_id

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.get("", response_model=list[ResourceOut])
async def get_all_resources():
    async with pool.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                """
                SELECT 
                    r.id, r.title, r.description, r.user_id, r.created_at,
                    rd.id AS detail_id, rd.link, rd.created_at AS detail_created_at
                FROM resources r
                LEFT JOIN resource_details rd ON r.id = rd.resource_id
                ORDER BY r.created_at DESC;
                """
            )
            rows = await cur.fetchall()
            
            results = []
            for row in rows:
                detail = None
                if row["detail_id"]:
                    detail = {
                        "id": row["detail_id"],
                        "resource_id": row["id"],
                        "link": row["link"],
                        "created_at": row["detail_created_at"]
                    }
                results.append({
                    "id": row["id"],
                    "title": row["title"],
                    "description": row["description"],
                    "user_id": row["user_id"],
                    "created_at": row["created_at"],
                    "details": detail
                })
            return results


@router.get("/{resource_id}", response_model=ResourceOut)
async def get_resource_by_id(resource_id: int):
    async with pool.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                """
                SELECT 
                    r.id, r.title, r.description, r.user_id, r.created_at,
                    rd.id AS detail_id, rd.link, rd.created_at AS detail_created_at
                FROM resources r
                LEFT JOIN resource_details rd ON r.id = rd.resource_id
                WHERE r.id = %s;
                """,
                (resource_id,)
            )
            row = await cur.fetchone()
            if not row:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
            
            detail = None
            if row["detail_id"]:
                detail = {
                    "id": row["detail_id"],
                    "resource_id": row["id"],
                    "link": row["link"],
                    "created_at": row["detail_created_at"]
                }
            return {
                "id": row["id"],
                "title": row["title"],
                "description": row["description"],
                "user_id": row["user_id"],
                "created_at": row["created_at"],
                "details": detail
            }


@router.post("", response_model=ResourceOut, status_code=status.HTTP_201_CREATED)
async def create_resource(
    resource: ResourceCreate,
    current_user_id: int = Depends(get_current_user_id)
):
    async with pool.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                """
                INSERT INTO resources (title, description, user_id)
                VALUES (%s, %s, %s)
                RETURNING id, title, description, user_id, created_at;
                """,
                (resource.title, resource.description, current_user_id)
            )
            new_resource = await cur.fetchone()

            await cur.execute(
                """
                INSERT INTO resource_details (resource_id, link)
                VALUES (%s, %s)
                RETURNING id, resource_id, link, created_at;
                """,
                (new_resource["id"], resource.link)
            )
            new_detail = await cur.fetchone()

            await conn.commit()
            new_resource["details"] = new_detail
            return new_resource


@router.put("/{resource_id}", response_model=ResourceOut)
async def update_resource(
    resource_id: int,
    updates: ResourceUpdate,
    current_user_id: int = Depends(get_current_user_id)
):
    async with pool.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT user_id FROM resources WHERE id = %s;", (resource_id,))
            existing = await cur.fetchone()
            if not existing:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
            
            if existing["user_id"] != current_user_id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this resource")

            if updates.title is not None or updates.description is not None:
                await cur.execute(
                    """
                    UPDATE resources
                    SET title = COALESCE(%s, title),
                        description = COALESCE(%s, description)
                    WHERE id = %s;
                    """,
                    (updates.title, updates.description, resource_id)
                )

            if updates.link is not None:
                await cur.execute(
                    "UPDATE resource_details SET link = %s WHERE resource_id = %s;",
                    (updates.link, resource_id)
                )

            await conn.commit()
            
            await cur.execute(
                """
                SELECT 
                    r.id, r.title, r.description, r.user_id, r.created_at,
                    rd.id AS detail_id, rd.link, rd.created_at AS detail_created_at
                FROM resources r
                LEFT JOIN resource_details rd ON r.id = rd.resource_id
                WHERE r.id = %s;
                """,
                (resource_id,)
            )
            row = await cur.fetchone()
            return {
                "id": row["id"],
                "title": row["title"],
                "description": row["description"],
                "user_id": row["user_id"],
                "created_at": row["created_at"],
                "details": {
                    "id": row["detail_id"],
                    "resource_id": row["id"],
                    "link": row["link"],
                    "created_at": row["detail_created_at"]
                } if row["detail_id"] else None
            }


@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resource(
    resource_id: int,
    current_user_id: int = Depends(get_current_user_id)
):
    async with pool.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT user_id FROM resources WHERE id = %s;", (resource_id,))
            existing = await cur.fetchone()
            if not existing:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")

            if existing["user_id"] != current_user_id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this resource")

            await cur.execute("DELETE FROM resources WHERE id = %s;", (resource_id,))
            await conn.commit()
            return