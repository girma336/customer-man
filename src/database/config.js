import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

export const db = mysql.createPool({
  host: process.env.MYSQL_HOST,
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
})

async function createCustomerTable() {
  try {
    const db = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
    });

    await db.query(`CREATE DATABASE IF NOT EXISTS ${process.env.MYSQL_DATABASE}`);
    await db.query(`USE ${process.env.MYSQL_DATABASE}`);

    const createCustomer = `CREATE TABLE IF NOT EXISTS Customer (
      customer_id INT PRIMARY KEY AUTO_INCREMENT,
      full_name VARCHAR(255) NOT NULL,
      phone_number VARCHAR(15) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      PIN VARCHAR(255) NOT NULL,
      activation_code VARCHAR(50),
      login_attempts INT DEFAULT 0,
      MAX_LOGIN_ATTEMPTS INT DEFAULT 3,
      is_blocked TINYINT(1) NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 0,
      device_code VARCHAR(255)
    );`;

    await db.query(createCustomer);

    console.log('Customer table created successfully!');
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
  }
}

createCustomerTable();

