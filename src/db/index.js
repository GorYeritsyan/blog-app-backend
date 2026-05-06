import { Pool } from "pg";

const db = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "admin",
});

export default db;