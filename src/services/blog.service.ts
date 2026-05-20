import type { BlogPost, BlogPostBody, BlogPostQuery, UpdateBlogPostProps } from "../types/types.js";
import { prisma } from "../lib/prisma.js";
import {UserDto} from "../dto/user.dto.js";
import {NotFoundError} from "../errors/index.js";
import {Prisma} from "../generated/prisma/client.js";

class BlogService {
    // Get all blog posts service
    async getBlogPosts({ query, limit, page, orderBy, order }: Required<BlogPostQuery>): Promise<{ data: BlogPost[]; totalPages: number }> {
        const skip = (+page - 1) * +limit;

        const allBlogPosts = await prisma.post.findMany({
            where: {
                ...(query && {
                    OR: [
                        { title: { contains: query, mode: "insensitive" } },
                        { content: { contains: query, mode: "insensitive" } },
                    ],
                }),
            },

            // Sort logic - { title: "asc" } || { content: "desc" } || etc...
            // Default - { createdAt: "asc" }
            orderBy: {
                [orderBy]: order
            },

            // Pagination
            take: +limit,
            skip,

            // Include author details
            include: {
                author: true,
                tags: true,
            }
        });

       // Total blog posts
        const totalBlogPosts = await prisma.post.count({
           where: {
               ...(query && {
                   OR: [
                       { title: { contains: query, mode: "insensitive" } },
                       { content: { contains: query, mode: "insensitive" } },
                   ]
               }),
           },
       });

       const totalPages = totalBlogPosts > 0 ? Math.ceil(totalBlogPosts / +limit) : 1;

       // Use UserDto for author to not send password
       const allBlogPostsDto = allBlogPosts.map(post => ({ ...post, author: new UserDto(post.author) }));

       return { data: allBlogPostsDto, totalPages };
    }

    // Get blog post by id service
    async getBlogPostById(id: number): Promise<BlogPost> {
        const blogPost = await prisma.post.findUnique({
            where: { id },
            include: { author: true, tags: true },
        });

        // If there blog post by provided ID not found throw error
        if (!blogPost) {
            throw new NotFoundError(`Blog Post by ID ${id} not found`);
        }

        const blogPostDto: BlogPost = { ...blogPost };

        if (blogPost?.author) {
            blogPostDto.author = new UserDto(blogPost.author);
        }

        return blogPostDto;
    }

    // Create new blog post service
    async createBlogPost({ title, content, tags, authorId }: BlogPostBody & { authorId: number }): Promise<BlogPost> {
        // TODO: Check query, need to use connect or just authorId
        const createQuery: Prisma.PostCreateInput = {
            title,
            content,
            author: {
                connect: { id: authorId },
            }
        };

        // If tags present in request body then attach it in query and create in the db
        if (tags && tags.length > 0) {
            createQuery.tags = {
                connectOrCreate: tags.map(tag => ({
                    create: { title: tag },
                    where: { title: tag },
                })),
            }
        }

        return prisma.post.create({
            data: createQuery,
            include: {
                author: true,
                tags: true,
            }
        });
    }

    // Update blog post by ID service
    async updateBlogPost({ id, data, authorId }: UpdateBlogPostProps & { authorId: number }): Promise<BlogPost> {
        const { title, content } = data;

        const updateQuery: Prisma.PostUpdateInput = {
            title,
            content,
            author: {
                connect: { id: authorId },
            }
        };

        // TODO: Check update query logic
        if (data.tags && data.tags.length > 0) {
            updateQuery.tags = {
                set: [],
                connectOrCreate: data.tags.map(tag => ({
                    where: { title: tag },
                    create: { title: tag },
                }))
            }
        }

        return prisma.post.update({
            where: {
                id
            },
            data: updateQuery,

            // Include author and tags fields
            include: {
                author: true,
                tags: true,
            }
        });
    }

    // Delete blog post by ID service
    async deleteBlogPost(id: number): Promise<BlogPost> {
        return prisma.post.delete({
            where: { id },
        });
    }
}

export default new BlogService();