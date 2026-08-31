import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ProjectDetailScene } from '@/components/three/ProjectDetailScene';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Github, Calendar, Users, Eye } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getProject(id: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!project) return null;

    // Increment views
    await prisma.project.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return {
      ...project,
      tags: (project.tags as string[]) ?? [],
      technologies: (project.technologies as string[]) ?? [],
      challenges: (project.challenges as string[]) ?? [],
      solutions: (project.solutions as string[]) ?? [],
      results: (project.results as string[]) ?? [],
      gallery: (project.gallery as string[]) ?? [],
    };
  } catch {
    return null;
  }
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id);
  if (!project) notFound();

  return (
    <div className="container-custom py-16 lg:py-24">
      <Link href="/portfolio" className="inline-flex items-center gap-2 text-sm text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to portfolio
      </Link>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <h1 className="text-4xl sm:text-5xl font-bold text-dark-900 dark:text-white mb-4">{project.title}</h1>
          <p className="text-lg text-dark-600 dark:text-dark-300 mb-6">{project.description}</p>

          <div className="flex flex-wrap gap-2 mb-6">
            {project.category && (
              <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: `${project.color}20`, color: project.color }}>
                {project.category.name}
              </span>
            )}
            {project.featured && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                Featured
              </span>
            )}
          </div>

          <ProjectDetailScene project={{ color: project.color }} />
        </div>

        <div className="space-y-6">
          {project.clientName && (
            <div className="card">
              <h3 className="font-semibold text-dark-900 dark:text-white mb-2">Client</h3>
              <p className="text-dark-600 dark:text-dark-400">{project.clientName}</p>
            </div>
          )}

          {project.duration && (
            <div className="card">
              <h3 className="font-semibold text-dark-900 dark:text-white mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-500" />
                Duration
              </h3>
              <p className="text-dark-600 dark:text-dark-400">{project.duration}</p>
            </div>
          )}

          {project.teamSize && (
            <div className="card">
              <h3 className="font-semibold text-dark-900 dark:text-white mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-500" />
                Team Size
              </h3>
              <p className="text-dark-600 dark:text-dark-400">{project.teamSize} people</p>
            </div>
          )}

          <div className="card">
            <h3 className="font-semibold text-dark-900 dark:text-white mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary-500" />
              Stats
            </h3>
            <p className="text-dark-600 dark:text-dark-400">{project.views.toLocaleString()} views</p>
          </div>

          <div className="space-y-3">
            {project.projectUrl && (
              <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="btn-primary w-full justify-center">
                <ExternalLink className="w-4 h-4" />
                Live Demo
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full justify-center">
                <Github className="w-4 h-4" />
                Source Code
              </a>
            )}
            <Link href={`/order?project=${project.id}`} className="btn-secondary w-full justify-center">
              Similar Project
            </Link>
          </div>
        </div>
      </div>

      {project.longDescription && (
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-4">About this project</h2>
          <p className="text-dark-600 dark:text-dark-300 leading-relaxed whitespace-pre-line">{project.longDescription}</p>
        </div>
      )}

      {project.technologies.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-4">Technologies</h2>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((t) => (
              <span key={t} className="px-3 py-1 rounded-full text-sm bg-dark-100 dark:bg-dark-800 text-dark-700 dark:text-dark-300">{t}</span>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {project.challenges.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-dark-900 dark:text-white mb-4">Challenges</h3>
            <ul className="space-y-2">
              {project.challenges.map((c, i) => (
                <li key={i} className="text-sm text-dark-600 dark:text-dark-400 flex gap-2"><span className="text-red-500">•</span>{c}</li>
              ))}
            </ul>
          </div>
        )}
        {project.solutions.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-dark-900 dark:text-white mb-4">Solutions</h3>
            <ul className="space-y-2">
              {project.solutions.map((s, i) => (
                <li key={i} className="text-sm text-dark-600 dark:text-dark-400 flex gap-2"><span className="text-blue-500">•</span>{s}</li>
              ))}
            </ul>
          </div>
        )}
        {project.results.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-dark-900 dark:text-white mb-4">Results</h3>
            <ul className="space-y-2">
              {project.results.map((r, i) => (
                <li key={i} className="text-sm text-dark-600 dark:text-dark-400 flex gap-2"><span className="text-green-500">✓</span>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}