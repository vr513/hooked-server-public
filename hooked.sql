-- Create the database if it doesn't exist
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
CREATE DATABASE IF NOT EXISTS hooked;

-- Use the created database
USE hooked;

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(100),
    password VARCHAR(100),
    registered TINYINT(1)
);

-- Create the info table with foreign key reference to users table
CREATE TABLE IF NOT EXISTS info (
    id VARCHAR(255) PRIMARY KEY,
    age INT,
    gender INT,
    picture VARCHAR(255),
    city VARCHAR(255),
    match_gender_preference INT,
    age_limit_lower INT,
    age_limit_upper INT,
    match_locality INT,
    username VARCHAR(255),
    dislikes JSON,
    likes JSON,
    matches JSON,
    likestome JSON,
    college_name VARCHAR(255),
    grad_year INT,
    FOREIGN KEY (id) REFERENCES users(id)
);
