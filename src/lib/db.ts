import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "12345678",
  database: "nextapp_db",
  port: 3306,
});

console.log("Database connection pool created");

export default db;