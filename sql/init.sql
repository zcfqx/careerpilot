PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    openid TEXT NOT NULL UNIQUE,
    nickname TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    answers TEXT,
    personality_result TEXT,
    interest_result TEXT,
    ability_result TEXT,
    values_result TEXT,
    overall_result TEXT,
    score INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_id ON assessments(user_id);

CREATE TABLE IF NOT EXISTS career_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    assessment_id INTEGER,
    career_direction TEXT,
    career_plan TEXT,
    skill_gaps TEXT,
    learning_plan TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_career_user_id ON career_plans(user_id);

CREATE TABLE IF NOT EXISTS job_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    salary_min INTEGER DEFAULT 0,
    salary_max INTEGER DEFAULT 0,
    city TEXT DEFAULT '',
    experience TEXT DEFAULT '',
    education TEXT DEFAULT '',
    description TEXT DEFAULT '',
    skill_tags TEXT DEFAULT '[]',
    source TEXT DEFAULT '',
    source_url TEXT DEFAULT '',
    publish_date TEXT,
    crawl_time TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_job_title ON job_data(job_title);
CREATE INDEX IF NOT EXISTS idx_job_city ON job_data(city);
CREATE INDEX IF NOT EXISTS idx_job_publish_date ON job_data(publish_date);

CREATE TABLE IF NOT EXISTS analysis_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    job_title TEXT,
    data TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_analysis_type ON analysis_results(type);
CREATE INDEX IF NOT EXISTS idx_analysis_job_title ON analysis_results(job_title);
