import dotenv from "dotenv";
dotenv.config();

const { DB_PORT, DB_USER, DB_PASSWORD } = process.env;

export { DB_PORT, DB_USER, DB_PASSWORD };