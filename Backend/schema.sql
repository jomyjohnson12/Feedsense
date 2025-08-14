-- users
CREATE TABLE IF NOT EXISTS users (
  UserId       INTEGER PRIMARY KEY AUTOINCREMENT,
  Name         TEXT NOT NULL,
  Mobile       TEXT NOT NULL,
  Email        TEXT NOT NULL UNIQUE,
  Username     TEXT NOT NULL UNIQUE,
  PasswordHash TEXT NOT NULL,
  CreatedAt    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- login_logs
CREATE TABLE IF NOT EXISTS login_logs (
  LogId         INTEGER PRIMARY KEY AUTOINCREMENT,
  EmployeeCode  INTEGER,
  EmployeeName  TEXT,
  LoginUserName TEXT NOT NULL,
  IPAddress     TEXT,
  LoginStatus   INTEGER NOT NULL DEFAULT 0,
  UserAgent     TEXT,
  LoginMethod   TEXT,
  SessionID     TEXT,
  GeoLatitude   REAL,
  GeoLongitude  REAL,
  GeoPlace      TEXT,
  CreatedAt     TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(EmployeeCode) REFERENCES users(UserId)
);
