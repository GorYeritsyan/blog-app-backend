import { Pool } from "pg";
import { DB_PASSWORD, DB_PORT, DB_USER, DATABASE_URL } from "../config/env.js";

const db = new Pool({
    // host: "localhost",
    // port: typeof DB_PORT !== "undefined" ? +DB_PORT : undefined,
    // user: DB_USER,
    // password: DB_PASSWORD,
    connectionString: DATABASE_URL
});

export default db;