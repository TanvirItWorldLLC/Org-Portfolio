import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, ok, unauthorized } from '@/lib/api';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { z } from 'zod';
import { slugify } from '@/lib/api';

const projectInputSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  longDescription: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  technologies: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  color: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  featured: z.boolean().optional(),
  clientName: z.string().optional().nullable(),
  projectUrl: z.string().optional().nullable(),
  githubUrl: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  teamSize: z.number().int().optional().nullable(),
  challenges: z.array(z.string()).optional().default([]),
  solutions: z.array(z.string()).optional().default([]),
  results: z.array(z.string()).optional().default([]),
  thumbnail: z.string().optional().nullable(),
  gallery: z.array(z.string()).optional().default([]),
});

function serializeProject(p: {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription: string | null;
  thumbnail: string | null;
  gallery: unknown;
  categoryId: string | null;
  technologies: unknown;
  tags: unknown;
  color: string;
  status: string;
  featured: boolean;
  views: number;
  clientName: string | null;
  projectUrl: string | null;
  githubUrl: string | null;
  duration: string | null;
  teamSize: number | null;
  challenges: unknown;
  solutions: unknown;
  results: unknown;
  createdAt: Date;
  updatedAt: Date;
  category?: {
    id: string;
    name: string;
    slug: string;
    color: string;
    icon: string | null;
  } | null;
}) {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description,
    longDescription: p.longDescription,
    thumbnail: p.thumbnail,
    gallery: p.gallery ?? [],
    categoryId: p.categoryId,
    technologies: p.technologies ?? [],
    tags: p.tags ?? [],
    color: p.color,
    status: p.status.toLowerCase(),
    featured: Boolean(p.featured),
    views: p.views,
    clientName: p.clientName,
    projectUrl: p.projectUrl,
    githubUrl: p.githubUrl,
    duration: p.duration,
    teamSize: p.teamSize,
    challenges: p.challenges ?? [],
    solutions: p.solutions ?? [],
    results: p.results ?? [],
    category: p.category
      ? {
          id: p.category.id,
          name: p.category.name,
          slug: p.category.slug,
          color: p.category.color,
          icon: p.category.icon,
        }
      : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get('page') || 1));
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit') || 12)));
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';
    const status = url.searchParams.get('status') || 'published';
    const sort = url.searchParams.get('sort') || 'newest';

    const where: Record<string, unknown> = {};
    if (status === 'all') {
      // no status filter
    } else if (status) {
      where.status = status.toUpperCase();
    }

    if (category) {
      const cat = await prisma.category.findUnique({ where: { slug: category } });
      if (cat) where.categoryId = cat.id;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    let orderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    if (sort === 'popular') orderBy = { views: 'desc' };
    if (sort === 'name') orderBy = { title: 'asc' };

    const [projects, total, categories] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true },
      }),
      prisma.project.count({ where }),
      prisma.category.findMany({ orderBy: { name: 'asc' } }),
    ]);

    return ok({
      projects: projects.map(serializeProject),
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        color: c.color,
        icon: c.icon,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') return unauthorized('Admin access required');

    const body = await req.json();
    const data = projectInputSchema.parse(body);

    const baseSlug = slugify(data.title);
    const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 10)}`;

    const project = await prisma.project.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        longDescription: data.longDescription ?? null,
        categoryId: data.categoryId ?? null,
        technologies: data.technologies as unknown as object,
        tags: data.tags as unknown as object,
        color: data.color ?? '#0ea5e9',
        status: data.status ?? 'DRAFT',
        featured: data.featured ?? false,
        clientName: data.clientName ?? null,
        projectUrl: data.projectUrl ?? null,
        githubUrl: data.githubUrl ?? null,
        duration: data.duration ?? null,
        teamSize: data.teamSize ?? null,
        challenges: data.challenges as unknown as object,
        solutions: data.solutions as unknown as object,
        results: data.results as unknown as object,
        thumbnail: data.thumbnail ?? null,
        gallery: data.gallery as unknown as object,
      },
      include: { category: true },
    });

    return ok({ project: serializeProject(project) }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}