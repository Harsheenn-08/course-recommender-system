import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "db.sqlite")
SCHEMA_FILE = os.path.join(os.path.dirname(__file__), "schema.sql")

# ---- 1. Some sample courses & electives ----
SEED_COURSES = [
    {
        "title": "Machine Learning Basics",
        "provider": "Coursera",
        "description": "Introductory ML course covering regression, classification and clustering.",
        "tags": "ml,ai,python",
        "min_cgpa": 6.0,
        "difficulty": "Intermediate",
        "duration_weeks": 8,
        "url": "",
        "source": "seed",
        "is_elective": 0,
    },
    {
        "title": "Web Development with React",
        "provider": "Udemy",
        "description": "Front-end development using React and modern JS.",
        "tags": "web,frontend,react",
        "min_cgpa": 0.0,
        "difficulty": "Beginner",
        "duration_weeks": 6,
        "url": "",
        "source": "seed",
        "is_elective": 0,
    },
    {
        "title": "College Elective: Data Mining",
        "provider": "CSE Dept",
        "description": "Department elective on data mining techniques and applications.",
        "tags": "data mining,ml,elective",
        "min_cgpa": 7.0,
        "difficulty": "Advanced",
        "duration_weeks": 12,
        "url": "",
        "source": "college",
        "is_elective": 1,
    },
    {
        "title": "College Elective: Cloud Computing",
        "provider": "CSE Dept",
        "description": "Elective covering AWS, Azure basics and cloud architectures.",
        "tags": "cloud,elective,systems",
        "min_cgpa": 6.5,
        "difficulty": "Intermediate",
        "duration_weeks": 12,
        "url": "",
        "source": "college",
        "is_elective": 1,
    },
]

def run_schema():
    conn = sqlite3.connect(DB_PATH)
    with open(SCHEMA_FILE, "r", encoding="utf-8") as f:
        sql = f.read()
    conn.executescript(sql)
    conn.commit()
    conn.close()
    print("Schema created.")

def seed_courses():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # optional: clear old data while developing
    cur.execute("DELETE FROM electives")
    cur.execute("DELETE FROM reviews")
    cur.execute("DELETE FROM interactions")
    cur.execute("DELETE FROM courses")

    for course in SEED_COURSES:
        cur.execute(
            """
            INSERT INTO courses
            (title, provider, description, tags, min_cgpa,
             difficulty, duration_weeks, url, source)
            VALUES (?,?,?,?,?,?,?,?,?)
            """,
            (
                course["title"],
                course["provider"],
                course["description"],
                course["tags"],
                course["min_cgpa"],
                course["difficulty"],
                course["duration_weeks"],
                course["url"],
                course["source"],
            ),
        )
        course_id = cur.lastrowid

        if course.get("is_elective", 0):
            cur.execute(
                "INSERT INTO electives (course_id) VALUES (?)",
                (course_id,),
            )

    conn.commit()
    conn.close()
    print(f"Seeded {len(SEED_COURSES)} courses.")

if __name__ == "__main__":
    run_schema()
    seed_courses()
