CREATE TABLE IF NOT EXISTS student (
    roll_no VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phn_no VARCHAR(10) NOT NULL,
    year VARCHAR(5) NOT NULL,
    department VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT UNIQUE NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    description JSON NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS registration (
    roll_no VARCHAR(10) NOT NULL,
    event_id BIGINT NOT NULL,
    attended INT NOT NULL DEFAULT 0,
    registered_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (roll_no, event_id),
    FOREIGN KEY (roll_no) REFERENCES student(roll_no) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES event(event_id) ON DELETE CASCADE
);