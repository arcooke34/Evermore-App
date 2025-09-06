from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import uuid
from datetime import datetime, date, timedelta


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Evermore Models
class UserCouple(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    partner_email: Optional[str] = None
    couple_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Progress(BaseModel):
    communication: float = 0.0
    intimacy: float = 0.0
    trust: float = 0.0

class Activity(BaseModel):
    title: str
    description: str
    completed: bool = False
    completed_at: Optional[datetime] = None

class ActivityEntry(BaseModel):
    activity_type: str  # 'dailyRitual', 'weeklyGesture', 'monthlyBigGesture'
    activity_title: str
    completed_date: date
    completed_at: datetime

class CoupleData(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    couple_id: str
    progress: Progress = Field(default_factory=Progress)
    tree_growth: float = 0.0
    streak: int = 0
    last_activity_date: Optional[date] = None
    daily_ritual: Activity
    weekly_gesture: Activity  
    monthly_big_gesture: Activity
    activity_history: List[ActivityEntry] = Field(default_factory=list)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ActivityCompletion(BaseModel):
    activity_type: str  # 'dailyRitual', 'weeklyGesture', 'monthlyBigGesture'

class CoupleDataResponse(BaseModel):
    progress: Progress
    tree_growth: float
    streak: int
    daily_ritual: Activity
    weekly_gesture: Activity
    monthly_big_gesture: Activity

# Default activities
DEFAULT_ACTIVITIES = {
    "daily_ritual": Activity(
        title="2-Minute Gratitude Hug",
        description="Share a warm, mindful hug while expressing one thing you're grateful for about each other"
    ),
    "weekly_gesture": Activity(
        title="Cook Together", 
        description="Prepare a meal together, trying a new recipe or recreating a favorite dish"
    ),
    "monthly_big_gesture": Activity(
        title="Plan Weekend Adventure",
        description="Design and plan a special weekend activity that you both will enjoy"
    )
}

# Evermore API Routes
@api_router.get("/")
async def root():
    return {"message": "Evermore API - Nurturing Love Through Action"}

@api_router.get("/couple-data/{couple_id}", response_model=CoupleDataResponse)
async def get_couple_data(couple_id: str):
    """Get couple's progress, activities, and tree growth"""
    couple_data = await db.couple_data.find_one({"couple_id": couple_id})
    
    if not couple_data:
        # Create new couple data with default activities
        new_couple_data = CoupleData(
            couple_id=couple_id,
            daily_ritual=DEFAULT_ACTIVITIES["daily_ritual"],
            weekly_gesture=DEFAULT_ACTIVITIES["weekly_gesture"],
            monthly_big_gesture=DEFAULT_ACTIVITIES["monthly_big_gesture"]
        )
        await db.couple_data.insert_one(new_couple_data.dict())
        couple_data = new_couple_data.dict()
    
    return CoupleDataResponse(
        progress=Progress(**couple_data["progress"]),
        tree_growth=couple_data["tree_growth"],
        streak=couple_data["streak"],
        daily_ritual=Activity(**couple_data["daily_ritual"]),
        weekly_gesture=Activity(**couple_data["weekly_gesture"]),
        monthly_big_gesture=Activity(**couple_data["monthly_big_gesture"])
    )

@api_router.post("/couple-data/{couple_id}/complete-activity")
async def complete_activity(couple_id: str, completion: ActivityCompletion):
    """Mark an activity as complete and update progress"""
    couple_data = await db.couple_data.find_one({"couple_id": couple_id})
    
    if not couple_data:
        raise HTTPException(status_code=404, detail="Couple data not found")
    
    # Progress increases for different activities
    progress_increases = {
        "dailyRitual": {"communication": 0.5, "intimacy": 0.3, "trust": 0.2},
        "weeklyGesture": {"communication": 1.0, "intimacy": 1.5, "trust": 1.0},
        "monthlyBigGesture": {"communication": 2.0, "intimacy": 3.0, "trust": 2.5}
    }
    
    # Tree growth increases
    tree_growth_increases = {
        "dailyRitual": 3,
        "weeklyGesture": 8, 
        "monthlyBigGesture": 15
    }
    
    activity_type = completion.activity_type
    if activity_type not in progress_increases:
        raise HTTPException(status_code=400, detail="Invalid activity type")
    
    # Update progress
    current_progress = couple_data["progress"]
    increase = progress_increases[activity_type]
    
    new_progress = {
        "communication": min(100, current_progress["communication"] + increase["communication"]),
        "intimacy": min(100, current_progress["intimacy"] + increase["intimacy"]),
        "trust": min(100, current_progress["trust"] + increase["trust"])
    }
    
    # Update tree growth
    new_tree_growth = min(100, couple_data["tree_growth"] + tree_growth_increases[activity_type])
    
    # Update streak (only for daily ritual)
    new_streak = couple_data["streak"]
    today = date.today()
    if activity_type == "dailyRitual":
        last_activity = couple_data.get("last_activity_date")
        if last_activity:
            last_date = datetime.fromisoformat(last_activity).date() if isinstance(last_activity, str) else last_activity
            if today == last_date + timedelta(days=1):
                new_streak += 1
            elif today == last_date:
                pass  # Same day, don't change streak
            else:
                new_streak = 1  # Reset streak
        else:
            new_streak = 1
    
    # Mark activity as completed and add to history
    activity_entry = ActivityEntry(
        activity_type=activity_type,
        activity_title=couple_data[activity_type]["title"],
        completed_date=today,
        completed_at=datetime.utcnow()
    )
    
    # Get current activity history or initialize empty list
    activity_history = couple_data.get("activity_history", [])
    activity_history.append(activity_entry.dict())
    
    update_data = {
        "progress": new_progress,
        "tree_growth": new_tree_growth,
        "streak": new_streak,
        "last_activity_date": today.isoformat(),
        "activity_history": activity_history,
        "updated_at": datetime.utcnow(),
        f"{activity_type}.completed": True,
        f"{activity_type}.completed_at": datetime.utcnow()
    }
    
    await db.couple_data.update_one(
        {"couple_id": couple_id},
        {"$set": update_data}
    )
    
    return {"message": "Activity completed successfully", "new_progress": new_progress, "tree_growth": new_tree_growth, "streak": new_streak}

@api_router.post("/couples", response_model=UserCouple)
async def create_couple_account(user: UserCouple):
    """Create a new couple account"""
    # Check if email already exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Generate couple_id if not provided
    if not user.couple_id:
        user.couple_id = str(uuid.uuid4())
    
    await db.users.insert_one(user.dict())
    return user

@api_router.get("/couple-data/{couple_id}/calendar/{year}/{month}")
async def get_calendar_data(couple_id: str, year: int, month: int):
    """Get calendar data for a specific month showing activity completions"""
    couple_data = await db.couple_data.find_one({"couple_id": couple_id})
    
    if not couple_data:
        raise HTTPException(status_code=404, detail="Couple data not found")
    
    # Get activity history for the specified month
    activity_history = couple_data.get("activity_history", [])
    
    # Filter activities for the specified month/year
    month_activities = []
    for activity in activity_history:
        activity_date = datetime.fromisoformat(activity["completed_date"]).date() if isinstance(activity["completed_date"], str) else activity["completed_date"]
        if activity_date.year == year and activity_date.month == month:
            month_activities.append({
                "date": activity_date.isoformat(),
                "activity_type": activity["activity_type"],
                "activity_title": activity["activity_title"],
                "completed_at": activity["completed_at"]
            })
    
    # Calculate activity density for heatmap (activities per day)
    activity_density = {}
    for activity in month_activities:
        date_key = activity["date"]
        if date_key not in activity_density:
            activity_density[date_key] = []
        activity_density[date_key].append(activity)
    
    return {
        "year": year,
        "month": month,
        "activities": month_activities,
        "activity_density": activity_density,
        "total_activities": len(month_activities)
    }

@api_router.get("/couple-data/{couple_id}/calendar/{year}/{month}/{day}")
async def get_day_activities(couple_id: str, year: int, month: int, day: int):
    """Get all activities completed on a specific day"""
    couple_data = await db.couple_data.find_one({"couple_id": couple_id})
    
    if not couple_data:
        raise HTTPException(status_code=404, detail="Couple data not found")
    
    target_date = date(year, month, day)
    activity_history = couple_data.get("activity_history", [])
    
    # Filter activities for the specific day
    day_activities = []
    for activity in activity_history:
        activity_date = datetime.fromisoformat(activity["completed_date"]).date() if isinstance(activity["completed_date"], str) else activity["completed_date"]
        if activity_date == target_date:
            day_activities.append({
                "activity_type": activity["activity_type"],
                "activity_title": activity["activity_title"],
                "completed_at": activity["completed_at"]
            })
    
    return {
        "date": target_date.isoformat(),
        "activities": day_activities,
        "activity_count": len(day_activities)
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
