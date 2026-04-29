import mysql from "mysql2/promise";


const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL_CA
    ? { ca: process.env.DB_SSL_CA }
    : undefined,
});

// Ensure the users table exists before the app starts using it
async function ensureSchema() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Schema check complete: users table ready");
  } catch (err) {
    console.error("Failed to ensure schema:", err);
  }
}

ensureSchema();

console.log("Database connection pool created");

export default db;