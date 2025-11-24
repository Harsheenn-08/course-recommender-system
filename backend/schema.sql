BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS courses (
  course_id     INTEGER PRIMARY KEY AUTOINCREMENT,
  title         TEXT NOT NULL,
  provider      TEXT,
  description   TEXT,
  tags          TEXT,
  min_cgpa      REAL DEFAULT 0,
  difficulty    TEXT,
  duration_weeks INTEGER DEFAULT 0,
  url           TEXT,
  source        TEXT,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS electives (
  elective_id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id   INTEGER NOT NULL,
  FOREIGN KEY(course_id) REFERENCES courses(course_id)
);

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

CREATE TABLE IF NOT EXISTS interactions (
  interaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        TEXT,
  course_id      INTEGER,
  event_type     TEXT,   -- "view", "complete", "purchase", "rating"
  details        TEXT,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(course_id) REFERENCES courses(course_id)
);

COMMIT;
