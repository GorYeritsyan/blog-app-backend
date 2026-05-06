import { Pool } from "pg";
import { DB_PASSWORD, DB_PORT, DB_USER } from "../config/env.js";

const db = new Pool({
    host: "localhost",
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
});

export default db;