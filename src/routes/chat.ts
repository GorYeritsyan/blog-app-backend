import { Router } from "express";
import {Groq} from "groq-sdk";
import {GROQ_API_KEY} from "../config/env.js";

const router = Router();

const groq = new Groq({ apiKey: GROQ_API_KEY });

router.post("/", async (req, res) => {
    const { content } = req.body;

    const message = await groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content
            },
        ],
        model: "llama-3.1-8b-instant",
    });

    res.status(201).send({ success: true, data: message });
});

export default router;