/* eslint-disable no-console */
import { PrismaClient, UserRole, UserStatus, ProjectStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ---- Admin user ----
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@orgportfolio.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.ADMIN_NAME || 'Admin User';

  const hashed = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashed,
      name: adminName,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`✓ Admin user: ${admin.email} (${adminPassword})`);

  // ---- Categories ----
  const categoryDefs = [
    {
      name: 'Web Experiences',
      slug: 'web',
      description: 'Interactive 3D websites and web applications',
      color: '#0ea5e9',
      icon: 'globe',
    },
    {
      name: 'Product Showcases',
      slug: 'product',
      description: '3D product visualizations and configurators',
      color: '#8b5cf6',
      icon: 'package',
    },
    {
      name: 'Brand Identity',
      slug: 'brand',
      description: '3D brand experiences and identity systems',
      color: '#ec4899',
      icon: 'palette',
    },
    {
      name: 'Interactive Art',
      slug: 'interactive',
      description: 'Creative coding and interactive installations',
      color: '#22d3ee',
      icon: 'zap',
    },
  ];

  const categories = await Promise.all(
    categoryDefs.map((cat) =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: cat,
        create: cat,
      }),
    ),
  );
  console.log(`✓ Categories: ${categories.length}`);

  const bySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  // ---- Sample projects ----
  const projectDefs = [
    {
      title: 'Aether - 3D Portfolio Template',
      slug: 'aether-3d-portfolio',
      description: 'A stunning 3D portfolio template with smooth animations and interactive elements.',
      longDescription:
        'Aether is a meticulously crafted 3D portfolio template designed for creative professionals. Built with React Three Fiber, it features smooth scroll-triggered animations, interactive 3D elements, and a fully responsive design that works beautifully across all devices.',
      thumbnail:
        'https://images.unsplash.com/photo-1558655146-9f40138edf3c?w=800&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1558655146-9f40138edf3c?w=1200&h=800&fit=crop',
      ],
      categoryId: bySlug.web.id,
      technologies: ['React', 'Three.js', 'React Three Fiber', 'Tailwind CSS', 'Framer Motion'],
      tags: ['portfolio', '3d', 'template', 'react', 'webgl'],
      color: '#0ea5e9',
      status: ProjectStatus.PUBLISHED,
      featured: true,
      views: 12500,
      clientName: 'Internal Project',
      projectUrl: 'https://aether-demo.orgportfolio.com',
      githubUrl: 'https://github.com/orgportfolio/aether',
      duration: '6 weeks',
      teamSize: 3,
      challenges: ['Complex scroll animations', 'Performance optimization', 'Cross-browser compatibility'],
      solutions: ['Custom scroll controller', 'Level of detail system', 'Progressive enhancement'],
      results: ['60fps on all devices', '95+ Lighthouse score', 'Featured on Awwwards'],
    },
    {
      title: 'Nebula - E-commerce 3D Experience',
      slug: 'nebula-ecommerce-3d',
      description: 'Immersive 3D product showcase with AR preview and real-time customization.',
      longDescription:
        'Nebula revolutionizes online shopping by bringing products to life in 3D. Customers can rotate, zoom, and customize products in real-time, with AR preview allowing them to visualize items in their own space before purchase.',
      thumbnail:
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=800&fit=crop',
      ],
      categoryId: bySlug.product.id,
      technologies: ['React', 'Three.js', 'WebXR', 'Stripe', 'Node.js', 'MySQL'],
      tags: ['ecommerce', '3d', 'ar', 'webxr', 'shopping'],
      color: '#8b5cf6',
      status: ProjectStatus.PUBLISHED,
      featured: true,
      views: 28400,
      clientName: 'TechStart Inc',
      projectUrl: 'https://nebula-demo.orgportfolio.com',
      githubUrl: 'https://github.com/orgportfolio/nebula',
      duration: '12 weeks',
      teamSize: 5,
      challenges: ['AR implementation', 'Real-time customization', 'Payment integration'],
      solutions: ['WebXR API with fallback', 'GPU-accelerated rendering', 'Stripe Elements integration'],
      results: ['40% increase in conversion', '2.5x average session duration', 'Featured on FWA'],
    },
    {
      title: 'Lumina - Brand Identity System',
      slug: 'lumina-brand-identity',
      description: 'Dynamic 3D brand identity with interactive logo and motion design system.',
      longDescription:
        'Lumina is a comprehensive brand identity system built around a living, breathing 3D logo. The identity adapts and responds to user interaction, creating a memorable brand experience across all touchpoints.',
      thumbnail:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=800&fit=crop',
      ],
      categoryId: bySlug.brand.id,
      technologies: ['Three.js', 'GSAP', 'After Effects', 'Figma', 'Principle'],
      tags: ['branding', '3d', 'motion', 'identity', 'logo'],
      color: '#ec4899',
      status: ProjectStatus.PUBLISHED,
      featured: false,
      views: 8900,
      clientName: 'Creative Agency',
      projectUrl: 'https://lumina-demo.orgportfolio.com',
      duration: '4 weeks',
      teamSize: 2,
      challenges: ['Logo animation system', 'Brand consistency', 'Asset delivery'],
      solutions: ['Procedural animation', 'Design tokens', 'Automated export pipeline'],
      results: ['Brand recognition +60%', 'Social engagement +150%', 'Client retained for 3 years'],
    },
  ];

  for (const def of projectDefs) {
    await prisma.project.upsert({
      where: { slug: def.slug },
      update: def,
      create: def,
    });
  }
  console.log(`✓ Projects: ${projectDefs.length}`);

  // ---- Default settings ----
  await prisma.setting.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default' },
  });
  console.log('✓ Settings: default row created');

  console.log('✅ Seed complete');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });