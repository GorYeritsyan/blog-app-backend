import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

const mockData = [
    { title: "Getting Started with React Hooks", content: "React Hooks revolutionized the way we write functional components. In this post, we explore useState, useEffect, and custom hooks with practical examples.", authorId: 1 },
    { title: "Understanding Async/Await in JavaScript", content: "Async/await makes asynchronous code look and behave like synchronous code. Learn how to handle promises more elegantly and avoid callback hell.", authorId: 1 },
    { title: "CSS Grid vs Flexbox: When to Use Which", content: "Both CSS Grid and Flexbox are powerful layout tools. This guide breaks down the key differences and helps you decide which one fits your use case.", authorId: 1 },
    { title: "A Deep Dive into TypeScript Generics", content: "Generics allow you to write reusable, type-safe code in TypeScript. We'll walk through real-world examples from simple functions to complex data structures.", authorId: 1 },
    { title: "Building REST APIs with Node.js and Express", content: "Step-by-step guide to building a production-ready REST API using Node.js and Express, including middleware, error handling, and authentication.", authorId: 1 },
    { title: "Introduction to Docker for Developers", content: "Docker simplifies deployment by containerizing your applications. Learn how to write Dockerfiles, manage images, and orchestrate containers with Docker Compose.", authorId: 1 },
    { title: "State Management with Zustand", content: "Zustand is a lightweight state management library for React. Discover how it compares to Redux and how to integrate it into your existing projects.", authorId: 1 },
    { title: "Optimizing PostgreSQL Queries", content: "Slow queries can cripple your application. This post covers indexing strategies, query planning, and common pitfalls to avoid in PostgreSQL.", authorId: 1 },
    { title: "Designing Accessible UIs from the Start", content: "Accessibility shouldn't be an afterthought. Learn how to implement ARIA labels, keyboard navigation, and color contrast standards in your UI components.", authorId: 1 },
    { title: "The Power of Python List Comprehensions", content: "List comprehensions offer a concise and readable way to create lists in Python. We cover basic syntax, nested comprehensions, and performance considerations.", authorId: 1 },
    { title: "How HTTPS Works Under the Hood", content: "Ever wondered what happens during an HTTPS handshake? This post demystifies TLS certificates, symmetric encryption, and the role of certificate authorities.", authorId: 1 },
    { title: "Mastering Git Rebase and Merge", content: "Rebasing and merging both integrate changes between branches, but they work very differently. Learn when to use each and how to resolve conflicts confidently.", authorId: 1 },
    { title: "Building a CI/CD Pipeline with GitHub Actions", content: "Automate your testing and deployment workflows using GitHub Actions. We'll set up a full pipeline from code push to production deployment.", authorId: 1 },
    { title: "Next.js App Router: A Complete Guide", content: "The App Router in Next.js 13+ changes how routing and layouts work. This guide covers file-based routing, server components, and data fetching patterns.", authorId: 1 },
    { title: "Writing Unit Tests with Vitest", content: "Vitest is a blazing-fast unit testing framework built for Vite projects. Learn how to write effective tests, mock dependencies, and measure coverage.", authorId: 1 },
    { title: "GraphQL vs REST: Choosing the Right API", content: "GraphQL and REST each have their strengths. This post compares query flexibility, over-fetching, tooling, and real-world use cases to help you decide.", authorId: 1 },
    { title: "An Introduction to WebSockets", content: "WebSockets enable real-time, bidirectional communication between client and server. Build a live chat feature from scratch to see them in action.", authorId: 1 },
    { title: "Functional Programming Concepts in JavaScript", content: "Explore immutability, pure functions, and higher-order functions. Learn how functional programming principles can make your JavaScript code more predictable.", authorId: 1 },
    { title: "Redis Caching Strategies Explained", content: "Caching with Redis can dramatically reduce database load. This post covers cache-aside, write-through, and TTL strategies with practical Node.js examples.", authorId: 1 },
    { title: "React Performance Optimization Tips", content: "Is your React app feeling sluggish? Learn how to use React.memo, useMemo, useCallback, and lazy loading to keep your components fast and efficient.", authorId: 1 },
    { title: "Securing Your Node.js Application", content: "Security is non-negotiable. We cover helmet.js, rate limiting, input sanitization, JWT best practices, and common vulnerabilities like XSS and SQL injection.", authorId: 1 },
    { title: "Understanding the JavaScript Event Loop", content: "The event loop is at the heart of JavaScript's concurrency model. Understand the call stack, task queue, and microtask queue with visual walkthroughs.", authorId: 1 },
    { title: "Getting Started with Tailwind CSS", content: "Tailwind CSS is a utility-first framework that speeds up UI development. Learn how to set it up, customize your theme, and avoid common pitfalls.", authorId: 1 },
    { title: "Monorepos with Turborepo", content: "Managing multiple packages in a single repo is easier with Turborepo. This post covers workspace setup, shared configs, and optimized build pipelines.", authorId: 1 },
    { title: "Building CLI Tools with Node.js", content: "Node.js is great for building command-line tools. We'll use Commander.js and Inquirer to build an interactive CLI app from scratch.", authorId: 1 },
    { title: "Intro to Machine Learning with Python", content: "Get started with machine learning using scikit-learn. We cover data preprocessing, model training, evaluation metrics, and cross-validation in plain language.", authorId: 1 },
    { title: "Database Migrations Best Practices", content: "Schema migrations can be risky if not handled carefully. Learn how to write safe, reversible migrations and integrate them into your deployment pipeline.", authorId: 1 },
    { title: "Using Environment Variables Safely", content: "Hardcoding secrets is a serious security risk. This post covers .env files, secret managers, and best practices for handling environment variables across environments.", authorId: 1 },
    { title: "Exploring the Fetch API", content: "The Fetch API is the modern way to make HTTP requests in the browser. We cover request options, error handling, streaming responses, and AbortController.", authorId: 1 },
    { title: "How to Write Good Technical Documentation", content: "Good docs are just as important as good code. Learn how to structure README files, API references, and tutorials that developers actually want to read.", authorId: 1 },
];

async function seedDB() {
    // Delete existing data
    await prisma.user.deleteMany();
    await prisma.post.deleteMany();

    // Hash the mock user password
    const hashedPassword = await bcrypt.hash("password", 10);

    // Seed db
    await prisma.user.create({
        data: {
            name: "John",
            email: "john@test.com",
            password: hashedPassword,
        }
    })

    // Create posts
    await prisma.post.createMany({
        data: mockData,
    });
}

seedDB().catch(console.error);