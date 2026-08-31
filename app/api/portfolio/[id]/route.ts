import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, notFound, ok, unauthorized } from '@/lib/api';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { z } from 'zod';

const projectPatchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  longDescription: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  technologies: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  color: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  featured: z.boolean().optional(),
  clientName: z.string().optional().nullable(),
  projectUrl: z.string().optional().nullable(),
  githubUrl: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  teamSize: z.number().int().optional().nullable(),
  challenges: z.array(z.string()).optional(),
  solutions: z.array(z.string()).optional(),
  results: z.array(z.string()).optional(),
  thumbnail: z.string().optional().nullable(),
  gallery: z.array(z.string()).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { category: true },
    });
    if (!project) return notFound('Project not found');

    // Increment views (atomic)
    await prisma.project.update({
      where: { id: project.id },
      data: { views: { increment: 1 } },
    });

    const serialized = {
      id: project.id,
      title: project.title,
      slug: project.slug,
      description: project.description,
      longDescription: project.longDescription,
      thumbnail: project.thumbnail,
      gallery: project.gallery ?? [],
      categoryId: project.categoryId,
      technologies: project.technologies ?? [],
      tags: project.tags ?? [],
      color: project.color,
      status: project.status.toLowerCase(),
      featured: project.featured,
      views: project.views + 1,
      clientName: project.clientName,
      projectUrl: project.projectUrl,
      githubUrl: project.githubUrl,
      duration: project.duration,
      teamSize: project.teamSize,
      challenges: project.challenges ?? [],
      solutions: project.solutions ?? [],
      results: project.results ?? [],
      category: project.category
        ? {
            id: project.category.id,
            name: project.category.name,
            slug: project.category.slug,
            color: project.category.color,
            icon: project.category.icon,
          }
        : null,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    };

    return ok({ project: serialized });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') return unauthorized('Admin access required');

    const existing = await prisma.project.findUnique({ where: { id: params.id } });
    if (!existing) return notFound('Project not found');

    const body = await req.json();
    const data = projectPatchSchema.parse(body);

    const updated = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...data,
        technologies: data.technologies as unknown as object | undefined,
        tags: data.tags as unknown as object | undefined,
        challenges: data.challenges as unknown as object | undefined,
        solutions: data.solutions as unknown as object | undefined,
        results: data.results as unknown as object | undefined,
        gallery: data.gallery as unknown as object | undefined,
      },
      include: { category: true },
    });

    return ok({
      project: {
        ...updated,
        status: updated.status.toLowerCase(),
        gallery: updated.gallery ?? [],
        technologies: updated.technologies ?? [],
        tags: updated.tags ?? [],
        challenges: updated.challenges ?? [],
        solutions: updated.solutions ?? [],
        results: updated.results ?? [],
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUserFromRequest(_req);
    if (!user || user.role !== 'ADMIN') return unauthorized('Admin access required');

    const existing = await prisma.project.findUnique({ where: { id: params.id } });
    if (!existing) return notFound('Project not found');

    await prisma.project.delete({ where: { id: params.id } });
    return ok({ message: 'Project deleted successfully' });
  } catch (err) {
    return handleApiError(err);
  }
}