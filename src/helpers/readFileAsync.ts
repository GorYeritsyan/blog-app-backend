import fs from "fs/promises";
import path from "path";
import { __dirname } from "../app.ts";

const readFileAsync = async (...args: string[]) => {
    const data = await fs.readFile(path.join(__dirname, ...args), "utf8");
    return JSON.parse(data);
}

export default readFileAsync;