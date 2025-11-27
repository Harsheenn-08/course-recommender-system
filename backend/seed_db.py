import sqlite3
import os
import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "db.sqlite")

# ---------- COURSES TO SEED ----------
SEED_COURSES = [
    # ---------- AI / ML ----------
    {
        "title": "Introduction to Artificial Intelligence",
        "provider": "Coursera",
        "description": "Fundamentals of AI including search, knowledge representation and basic machine learning.",
        "tags": "AI, ML, Data Science",
        "min_cgpa": 6.5,
        "difficulty": "Beginner",
        "duration_weeks": 6,
        "url": "",
        "source": "external",
        "is_elective": 0,
    },
    {
        "title": "Machine Learning Basics",
        "provider": "Coursera",
        "description": "Introductory ML course covering regression, classification and clustering.",
        "tags": "ML, AI, Data Science",
        "min_cgpa": 6.0,
        "difficulty": "Intermediate",
        "duration_weeks": 8,
        "url": "",
        "source": "external",
        "is_elective": 0,
    },
    {
        "title": "Deep Learning with Neural Networks",
        "provider": "Udemy",
        "description": "Hands-on deep learning with TensorFlow and PyTorch covering CNNs and RNNs.",
        "tags": "ML, AI, Data Science",
        "min_cgpa": 7.0,
        "difficulty": "Advanced",
        "duration_weeks": 10,
        "url": "",
        "source": "external",
        "is_elective": 0,
    },
    {
        "title": "Applied Machine Learning for Engineers",
        "provider": "NPTEL",
        "description": "Practical ML techniques for engineering students with case studies.",
        "tags": "ML, Data Science, AI",
        "min_cgpa": 6.0,
        "difficulty": "Intermediate",
        "duration_weeks": 12,
        "url": "",
        "source": "college",
        "is_elective": 1,
    },

    # ---------- Data Science / Analytics ----------
    {
        "title": "Data Science with Python",
        "provider": "Coursera",
        "description": "Data analysis using NumPy, Pandas, Matplotlib and basic statistics.",
        "tags": "Data Science, ML, AI",
        "min_cgpa": 6.0,
        "difficulty": "Beginner",
        "duration_weeks": 8,
        "url": "",
        "source": "external",
        "is_elective": 0,
    },
    {
        "title": "Statistics for Data Science",
        "provider": "College CSE Dept",
        "description": "Department elective on probability, inference, regression and experimentation.",
        "tags": "Data Science, Finance",
        "min_cgpa": 7.0,
        "difficulty": "Intermediate",
        "duration_weeks": 12,
        "url": "",
        "source": "college",
        "is_elective": 1,
    },
    {
        "title": "Business Analytics and Visualization",
        "provider": "edX",
        "description": "Covers Excel, SQL and dashboards for business decision making.",
        "tags": "Data Science, Finance",
        "min_cgpa": 5.5,
        "difficulty": "Beginner",
        "duration_weeks": 6,
        "url": "",
        "source": "external",
        "is_elective": 0,
    },

    # ---------- Web Development ----------
    {
        "title": "Web Development with React",
        "provider": "Udemy",
        "description": "Front-end development using React and modern JavaScript.",
        "tags": "Web Development, UI/UX",
        "min_cgpa": 0.0,
        "difficulty": "Beginner",
        "duration_weeks": 6,
        "url": "",
        "source": "external",
        "is_elective": 0,
    },
    {
        "title": "Full-Stack Web Development (MERN)",
        "provider": "Internshala",
        "description": "Project-based MERN stack course covering MongoDB, Express, React and Node.",
        "tags": "Web Development, UI/UX, Cloud Computing",
        "min_cgpa": 6.0,
        "difficulty": "Intermediate",
        "duration_weeks": 10,
        "url": "",
        "source": "external",
        "is_elective": 0,
    },
    {
        "title": "Advanced Frontend: Performance and Accessibility",
        "provider": "College CSE Dept",
        "description": "Elective focusing on web performance optimization and accessible UI design.",
        "tags": "Web Development, UI/UX",
        "min_cgpa": 7.5,
        "difficulty": "Advanced",
        "duration_weeks": 12,
        "url": "",
        "source": "college",
        "is_elective": 1,
    },

    # ---------- Cybersecurity ----------
    {
        "title": "Introduction to Cybersecurity",
        "provider": "Cisco Networking Academy",
        "description": "Basic cyber security concepts, threats and protection mechanisms.",
        "tags": "Cybersecurity, AI",
        "min_cgpa": 5.5,
        "difficulty": "Beginner",
        "duration_weeks": 6,
        "url": "",
        "source": "external",
        "is_elective": 0,
    },
    {
        "title": "Ethical Hacking and Penetration Testing",
        "provider": "Udemy",
        "description": "Practical ethical hacking course covering Kali Linux and common exploits.",
        "tags": "Cybersecurity",
        "min_cgpa": 6.5,
        "difficulty": "Intermediate",
        "duration_weeks": 8,
        "url": "",
        "source": "external",
        "is_elective": 0,
    },

    # ---------- Cloud / DevOps ----------
    {
        "title": "Cloud Computing Fundamentals",
        "provider": "NPTEL",
        "description": "Concepts of virtualization, IaaS, PaaS and SaaS with examples.",
        "tags": "Cloud Computing",
        "min_cgpa": 6.0,
        "difficulty": "Beginner",
        "duration_weeks": 8,
        "url": "",
        "source": "college",
        "is_elective": 1,
    },
    {
        "title": "AWS Cloud Practitioner Essentials",
        "provider": "AWS Skill Builder",
        "description": "Introduction to core AWS services, security and pricing.",
        "tags": "Cloud Computing, DevOps",
        "min_cgpa": 5.5,
        "difficulty": "Beginner",
        "duration_weeks": 4,
        "url": "",
        "source": "external",
        "is_elective": 0,
    },
    {
        "title": "DevOps with Docker and Kubernetes",
        "provider": "Udemy",
        "description": "CI/CD pipelines, Docker, Kubernetes deployments and monitoring.",
        "tags": "Cloud Computing, DevOps",
        "min_cgpa": 6.5,
        "difficulty": "Intermediate",
        "duration_weeks": 8,
        "url": "",
        "source": "external",
        "is_elective": 0,
    },

    # ---------- IoT / Blockchain ----------
    {
        "title": "Internet of Things Foundations",
        "provider": "NPTEL",
        "description": "Sensors, microcontrollers and communication protocols for IoT.",
        "tags": "IoT, Cloud Computing",
        "min_cgpa": 6.0,
        "difficulty": "Intermediate",
        "duration_weeks": 12,
        "url": "",
        "source": "college",
        "is_elective": 1,
    },
    {
        "title": "Blockchain Basics",
        "provider": "Coursera",
        "description": "Concepts of distributed ledgers, consensus mechanisms and smart contracts.",
        "tags": "Blockchain, Finance",
        "min_cgpa": 6.0,
        "difficulty": "Beginner",
        "duration_weeks": 4,
        "url": "",
        "source": "external",
        "is_elective": 0,
    },
    {
        "title": "Building DApps on Ethereum",
        "provider": "Udemy",
        "description": "Develop decentralized applications using Solidity and Ethereum.",
        "tags": "Blockchain, Web Development",
        "min_cgpa": 7.0,
        "difficulty": "Advanced",
        "duration_weeks": 8,
        "url": "",
        "source": "external",
        "is_elective": 0,
    },

    # ---------- Finance / Soft Skills ----------
    {
        "title": "Financial Markets and Investment Basics",
        "provider": "Coursera",
        "description": "Introduction to stock markets, mutual funds and risk management.",
        "tags": "Finance, Data Science",
        "min_cgpa": 5.5,
        "difficulty": "Beginner",
        "duration_weeks": 6,
        "url": "",
        "source": "external",
        "is_elective": 0,
    },
    {
        "title": "Quantitative Finance with Python",
        "provider": "edX",
        "description": "Use Python for portfolio optimization, pricing and risk analytics.",
        "tags": "Finance, Data Science, ML",
        "min_cgpa": 7.0,
        "difficulty": "Advanced",
        "duration_weeks": 10,
        "url": "",
        "source": "external",
        "is_elective": 0,
    },
    {
        "title": "Communication and Presentation Skills",
        "provider": "College HSS Dept",
        "description": "Soft-skills elective focusing on presentations, teamwork and interview skills.",
        "tags": "UI/UX, Finance",
        "min_cgpa": 0.0,
        "difficulty": "Beginner",
        "duration_weeks": 6,
        "url": "",
        "source": "college",
        "is_elective": 1,
    },

    # ---------- UI/UX ----------
    {
        "title": "UI/UX Design Fundamentals",
        "provider": "Google Career Certificates",
        "description": "User research, wireframing, prototyping and usability testing.",
        "tags": "UI/UX, Web Development",
        "min_cgpa": 5.5,
        "difficulty": "Beginner",
        "duration_weeks": 8,
        "url": "",
        "source": "external",
        "is_elective": 0,
    },
]


def init_db():
    """Create tables if they don't exist."""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # courses table
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS courses (
            course_id      INTEGER PRIMARY KEY AUTOINCREMENT,
            title          TEXT NOT NULL,
            provider       TEXT,
            description    TEXT,
            tags           TEXT,
            min_cgpa       REAL,
            difficulty     TEXT,
            duration_weeks INTEGER,
            url            TEXT,
            source         TEXT
        );
        """
    )

    # electives table
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS electives (
            elective_id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id   INTEGER NOT NULL,
            FOREIGN KEY(course_id) REFERENCES courses(course_id)
        );
        """
    )

    # reviews table
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS reviews (
            review_id     INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id     INTEGER NOT NULL,
            user_id       TEXT,
            reviewer_name TEXT,
            rating        INTEGER CHECK (rating >= 1 AND rating <= 5),
            pros          TEXT,
            cons          TEXT,
            comment       TEXT,
            is_senior     INTEGER DEFAULT 0,
            created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(course_id) REFERENCES courses(course_id)
        );
        """
    )

    # interactions table
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS interactions (
            interaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id        TEXT,
            course_id      INTEGER,
            event_type     TEXT,
            details        TEXT,
            created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(course_id) REFERENCES courses(course_id)
        );
        """
    )

    conn.commit()
    conn.close()


def seed_courses():
    """Clear existing data and insert seed courses."""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Clear tables while developing
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


if __name__ == "__main__":
    print(f"Using DB at: {DB_PATH}")
    init_db()
    print("Tables created (if not exist).")
    seed_courses()
    print(f"Seeded {len(SEED_COURSES)} courses.")
