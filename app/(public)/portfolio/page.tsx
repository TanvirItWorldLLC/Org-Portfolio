import { prisma } from '@/lib/prisma';
import { PortfolioBrowser, type Project } from './PortfolioBrowser';

export const metadata = { title: 'Portfolio' };

export const dynamic = 'force-dynamic';

async function getData() {
  try {
    const [projectsRes, categories] = await Promise.all([
      prisma.project.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        include: { category: true },
        take: 100,
      }),
      prisma.category.findMany({ orderBy: { name: 'asc' } }),
    ]);

    const projects: Project[] = projectsRes.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      description: p.description,
      color: p.color,
      featured: p.featured,
      views: p.views,
      tags: (p.tags as string[]) ?? [],
      category: p.category
        ? { id: p.category.id, name: p.category.name, slug: p.category.slug, color: p.category.color }
        : null,
    }));

    return {
      projects,
      categories: categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, color: c.color, icon: c.icon })),
    };
  } catch {
    return { projects: [] as Project[], categories: [] as Array<{ id: string; name: string; slug: string; color: string; icon: string | null }> };
  }
}

export default async function PortfolioPage() {
  const { projects, categories } = await getData();
  return (
    <div className="container-custom py-16 lg:py-24">
      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-dark-900 dark:text-white mb-4">
          Our <span className="gradient-text">Portfolio</span>
        </h1>
        <p className="text-lg text-dark-600 dark:text-dark-300 max-w-2xl">
          Explore our collection of immersive 3D web experiences, interactive product showcases, and digital art installations.
        </p>
      </div>
      <PortfolioBrowser initialProjects={projects} initialCategories={categories as never} />
    </div>
  );
}