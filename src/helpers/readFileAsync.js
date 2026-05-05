import fs from "fs/promises";
import path from "path";
import { __dirname } from "../app.js";

const readFileAsync = async (...args) => {
    const data = await fs.readFile(path.join(__dirname, ...args), "utf8");
    return JSON.parse(data);
}

export default readFileAsync;