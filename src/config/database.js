import dotenv from "dotenv";
import mysql from "mysql2";
dotenv.config();

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.SECRET_HOST,
  user: process.env.SECRET_USER,
  password: process.env.SECRET_DBPASSWORD,
  database: process.env.SECRET_DB,
});

export default pool;
