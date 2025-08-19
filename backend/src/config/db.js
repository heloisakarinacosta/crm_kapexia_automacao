const mysql = require("mysql2/promise");
const fs = require("fs");

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || "db",
  user: process.env.DB_USER || "crm_user",
  password: process.env.DB_PASSWORD || "userpassword",
  database: process.env.DB_NAME || "crm_kapexia_db",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // SSL configuration - paths are relative to where the app is running (inside the Docker container)
  // ssl: {
  //   ca: fs.readFileSync(process.env.SSL_DB_CA_PATH || "/path/to/ca-cert.pem"), // CA certificate
  //   // key: fs.readFileSync(process.env.SSL_DB_KEY_PATH), // Client key (if required by server)
  //   // cert: fs.readFileSync(process.env.SSL_DB_CERT_PATH), // Client certificate (if required by server)
  //   rejectUnauthorized: true // Important for production to verify server cert against CA
  // }
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Test the connection
async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("Successfully connected to the MariaDB database.");
    // Perform a simple query to test
    const [rows] = await connection.execute("SELECT 1 + 1 AS solution");
    console.log("Test query result:", rows[0].solution);
  } catch (error) {
    console.error("Error connecting to the MariaDB database:", error);
    // Exit process if DB connection fails on startup in a real scenario, or handle appropriately
    // process.exit(1);
  } finally {
    if (connection) connection.release();
  }
}

// Call testConnection on module load for initial check, or integrate into app startup
// testConnection(); 

module.exports = {
  pool,
  testConnection // Export testConnection if you want to call it explicitly during app startup
};

