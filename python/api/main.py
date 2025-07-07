"""
FastAPI を使ったWeb API デモンストレーション
RESTful API の基本的な実装例
"""

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import uvicorn
from datetime import datetime
import json


app = FastAPI(
    title="AI Agent Development API",
    description="AIエージェント開発デモ用API",
    version="1.0.0"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# データモデル
class Task(BaseModel):
    id: Optional[int] = None
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    completed: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    completed: Optional[bool] = None


# インメモリデータベース（デモ用）
tasks_db: List[Task] = []
task_counter = 0


def get_next_id() -> int:
    """次のIDを取得"""
    global task_counter
    task_counter += 1
    return task_counter


@app.get("/")
async def root():
    """ルートエンドポイント"""
    return {
        "message": "AI Agent Development API",
        "version": "1.0.0",
        "endpoints": {
            "tasks": "/tasks",
            "docs": "/docs",
            "health": "/health"
        }
    }


@app.get("/health")
async def health_check():
    """ヘルスチェック"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "tasks_count": len(tasks_db)
    }


@app.get("/tasks", response_model=List[Task])
async def get_tasks(
    completed: Optional[bool] = Query(None, description="完了状態でフィルター"),
    limit: int = Query(100, ge=1, le=1000, description="取得件数制限"),
    offset: int = Query(0, ge=0, description="オフセット")
):
    """タスク一覧を取得"""
    filtered_tasks = tasks_db
    
    # 完了状態でフィルター
    if completed is not None:
        filtered_tasks = [task for task in filtered_tasks if task.completed == completed]
    
    # ページネーション
    paginated_tasks = filtered_tasks[offset:offset + limit]
    
    return paginated_tasks


@app.get("/tasks/{task_id}", response_model=Task)
async def get_task(task_id: int):
    """特定のタスクを取得"""
    task = next((task for task in tasks_db if task.id == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail="タスクが見つかりません")
    return task


@app.post("/tasks", response_model=Task, status_code=201)
async def create_task(task_data: TaskCreate):
    """新しいタスクを作成"""
    now = datetime.now()
    task = Task(
        id=get_next_id(),
        title=task_data.title,
        description=task_data.description,
        completed=False,
        created_at=now,
        updated_at=now
    )
    tasks_db.append(task)
    return task


@app.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: int, task_update: TaskUpdate):
    """タスクを更新"""
    task = next((task for task in tasks_db if task.id == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail="タスクが見つかりません")
    
    # 更新データを適用
    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    
    task.updated_at = datetime.now()
    return task


@app.delete("/tasks/{task_id}")
async def delete_task(task_id: int):
    """タスクを削除"""
    task_index = next((i for i, task in enumerate(tasks_db) if task.id == task_id), None)
    if task_index is None:
        raise HTTPException(status_code=404, detail="タスクが見つかりません")
    
    deleted_task = tasks_db.pop(task_index)
    return {"message": "タスクを削除しました", "deleted_task": deleted_task}


@app.get("/tasks/stats/summary")
async def get_tasks_summary():
    """タスクの統計情報"""
    total_tasks = len(tasks_db)
    completed_tasks = len([task for task in tasks_db if task.completed])
    pending_tasks = total_tasks - completed_tasks
    
    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "completion_rate": (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    }


@app.post("/tasks/batch", response_model=List[Task])
async def create_tasks_batch(tasks_data: List[TaskCreate]):
    """複数のタスクを一括作成"""
    created_tasks = []
    now = datetime.now()
    
    for task_data in tasks_data:
        task = Task(
            id=get_next_id(),
            title=task_data.title,
            description=task_data.description,
            completed=False,
            created_at=now,
            updated_at=now
        )
        tasks_db.append(task)
        created_tasks.append(task)
    
    return created_tasks


# 初期データ投入
@app.on_event("startup")
async def startup_event():
    """アプリケーション起動時の処理"""
    # サンプルタスクを作成
    sample_tasks = [
        TaskCreate(title="APIドキュメント作成", description="FastAPIの自動生成ドキュメントを確認"),
        TaskCreate(title="データベース設計", description="タスク管理システムのDB設計"),
        TaskCreate(title="フロントエンド実装", description="React.jsでUIを作成"),
    ]
    
    now = datetime.now()
    for i, task_data in enumerate(sample_tasks, 1):
        task = Task(
            id=i,
            title=task_data.title,
            description=task_data.description,
            completed=False,
            created_at=now,
            updated_at=now
        )
        tasks_db.append(task)
    
    global task_counter
    task_counter = len(sample_tasks)
    
    print("サンプルタスクを作成しました")


if __name__ == "__main__":
    print("FastAPI サーバーを起動中...")
    print("API ドキュメント: http://localhost:8000/docs")
    print("API エンドポイント: http://localhost:8000")
    
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )