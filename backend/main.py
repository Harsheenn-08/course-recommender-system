from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3, os, datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "db.sqlite")

app = FastAPI()

# Allow frontend (Next.js) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # in production, restrict to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# ---------- Pydantic models ----------

class RecommendReq(BaseModel):
    cgpa: float
    interests: list[str] = []
    top_k: int = 10

class ReviewReq(BaseModel):
    course_id: int
    user_id: str | None = None
    reviewer_name: str | None = None
    rating: int
    pros: str | None = None
    cons: str | None = None
    comment: str | None = None
    is_senior: int = 0

# ---------- Helper ----------

def get_avg_rating(course_id: int):
    conn = get_conn()
    row = conn.execute(
        "SELECT AVG(rating) AS avg_rating, COUNT(*) AS cnt FROM reviews WHERE course_id=?",
        (course_id,),
    ).fetchone()
    conn.close()
    avg = row["avg_rating"] if row["avg_rating"] is not None else 0.0
    cnt = row["cnt"] if row["cnt"] is not None else 0
    return float(avg), int(cnt)

# ---------- Endpoints ----------

@app.get("/api/courses")
def list_courses():
    conn = get_conn()
    cur = conn.cursor()
    rows = cur.execute("SELECT * FROM courses ORDER BY created_at DESC").fetchall()
    conn.close()

    result = []
    for r in rows:
        avg, cnt = get_avg_rating(r["course_id"])
        result.append({
            "course_id": r["course_id"],
            "title": r["title"],
            "provider": r["provider"],
            "description": r["description"],
            "tags": r["tags"],
            "min_cgpa": r["min_cgpa"],
            "difficulty": r["difficulty"],
            "duration_weeks": r["duration_weeks"],
            "avg_rating": avg,
            "rating_count": cnt,
        })
    return {"courses": result}

@app.get("/api/course/{course_id}")
def get_course(course_id: int):
    conn = get_conn()
    row = conn.execute("SELECT * FROM courses WHERE course_id=?", (course_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Course not found")
    reviews = conn.execute(
        "SELECT reviewer_name, rating, pros, cons, comment, is_senior, created_at "
        "FROM reviews WHERE course_id=? ORDER BY created_at DESC",
        (course_id,),
    ).fetchall()
    conn.close()

    avg, cnt = get_avg_rating(course_id)
    return {
        "course": dict(row),
        "avg_rating": avg,
        "rating_count": cnt,
        "reviews": [dict(r) for r in reviews],
    }

@app.post("/api/review")
def add_review(req: ReviewReq):
    conn = get_conn()
    conn.execute(
        """
        INSERT INTO reviews
        (course_id, user_id, reviewer_name, rating, pros, cons, comment, is_senior, created_at)
        VALUES (?,?,?,?,?,?,?,?,?)
        """,
        (
            req.course_id,
            req.user_id,
            req.reviewer_name,
            req.rating,
            req.pros,
            req.cons,
            req.comment,
            req.is_senior,
            datetime.datetime.utcnow(),
        ),
    )
    conn.execute(
        "INSERT INTO interactions (user_id, course_id, event_type, details, created_at) "
        "VALUES (?,?,?,?,?)",
        (req.user_id or "anon", req.course_id, "rating", f"rating={req.rating}", datetime.datetime.utcnow()),
    )
    conn.commit()
    conn.close()
    return {"status": "ok"}

@app.post("/api/complete")
def mark_complete(payload: dict):
    user_id = payload.get("user_id", "anon")
    course_id = int(payload.get("course_id"))
    conn = get_conn()
    conn.execute(
        "INSERT INTO interactions (user_id, course_id, event_type, details, created_at) "
        "VALUES (?,?,?,?,?)",
        (user_id, course_id, "complete", "user completed course", datetime.datetime.utcnow()),
    )
    conn.commit()
    conn.close()
    return {"status": "ok"}

@app.post("/api/recommend")
def recommend(req: RecommendReq):
    """
    Simple rule-based recommender for Backend #1:
    - Filters by CGPA
    - Scores by tag overlap with interests
    (Later we will replace this with a proper ML model.)
    """
    conn = get_conn()
    rows = conn.execute("SELECT * FROM courses").fetchall()
    conn.close()

    interests = [i.strip().lower() for i in (req.interests or []) if i.strip()]
    interests_set = set(interests)

    scored = []
    for r in rows:
        # CGPA filter
        min_cg = r["min_cgpa"] if r["min_cgpa"] is not None else 0.0
        if min_cg > req.cgpa:
            continue

        # Tag overlap
        tags = r["tags"] or ""
        tag_set = set(t.strip().lower() for t in tags.split(",") if t.strip())
        overlap = len(interests_set & tag_set)
        score = overlap

        avg_rating, _ = get_avg_rating(r["course_id"])
        score += (avg_rating - 3.0) * 0.3   # small rating boost

        scored.append((score, r))

    scored.sort(key=lambda x: x[0], reverse=True)
    top = [dict(r) for (s, r) in scored[: req.top_k]]

    return {"results": top}

@app.post("/api/pay")
def pay(payload: dict):
    """Dummy payment: just log and return redirect URL."""
    course_id = payload.get("course_id")
    user_id = payload.get("user_id", "anon")
    conn = get_conn()
    conn.execute(
        "INSERT INTO interactions (user_id, course_id, event_type, details, created_at) "
        "VALUES (?,?,?,?,?)",
        (user_id, course_id, "purchase", "fake payment", datetime.datetime.utcnow()),
    )
    conn.commit()
    conn.close()
    return {"redirect": f"/payment_page?course_id={course_id}"}

@app.get("/payment_page")
def payment_page(course_id: int | None = None):
    return f"""
    <html><body>
      <h3>Fake Payment Page</h3>
      <p>Course ID: {course_id}</p>
      <form method="POST" action="/payment_submit">
        <input type="hidden" name="course_id" value="{course_id}" />
        Card Number: <input name="card_number" /><br/>
        Expiry: <input name="expiry" /><br/>
        CVV: <input name="cvv" /><br/>
        <button type="submit">Pay (Fake)</button>
      </form>
    </body></html>
    """

@app.post("/payment_submit")
async def payment_submit(request: Request):
    form = await request.form()
    course_id = int(form.get("course_id") or -1)
    conn = get_conn()
    conn.execute(
        "INSERT INTO interactions (user_id, course_id, event_type, details, created_at) "
        "VALUES (?,?,?,?,?)",
        ("anon", course_id, "purchase", "fake payment submit", datetime.datetime.utcnow()),
    )
    conn.commit()
    conn.close()
    return "<html><body><h3>Fake payment successful. You can close this tab.</h3></body></html>"
