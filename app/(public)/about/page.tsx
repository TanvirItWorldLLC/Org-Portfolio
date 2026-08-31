import Link from 'next/link';
import { ArrowRight, CheckCircle, Sparkles, Heart, Zap, Award } from 'lucide-react';

export const metadata = { title: 'About Us' };

export default function AboutPage() {
  return (
    <div className="container-custom py-16 lg:py-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-dark-900 dark:text-white mb-4">
            About <span className="gradient-text">Org Portfolio</span>
          </h1>
          <p className="text-lg text-dark-600 dark:text-dark-300 max-w-2xl mx-auto">
            We&apos;re a team of designers, developers, and 3D artists building the next generation of web experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            { icon: Sparkles, title: 'Craftsmanship', desc: 'Every pixel, every interaction — obsessively tuned.' },
            { icon: Zap, title: 'Speed', desc: '60fps experiences, sub-second loads, zero jank.' },
            { icon: Heart, title: 'Empathy', desc: 'We design for people, not just stakeholders.' },
          ].map((v) => (
            <div key={v.title} className="card text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                <v.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">{v.title}</h3>
              <p className="text-dark-600 dark:text-dark-400">{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="card mb-16">
          <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-4">Our Story</h2>
          <p className="text-dark-600 dark:text-dark-300 leading-relaxed mb-4">
            Org Portfolio was founded on a simple belief: the web is a 3D medium, and most sites are leaving its power on the table.
            We help ambitious brands turn static pages into living, interactive experiences that convert visitors into believers.
          </p>
          <p className="text-dark-600 dark:text-dark-300 leading-relaxed">
            From immersive product configurators to data viz dashboards and full 3D marketing sites, we ship work that wins awards and — more importantly — drives measurable results.
          </p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-primary-500" />
            Recognition
          </h2>
          <ul className="space-y-3">
            {[
              'Featured on Awwwards (3x)',
              'FWA Site of the Day',
              'CSS Design Awards Special Kudos',
              'Top 1% WebGL studios (Clutch)',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-dark-700 dark:text-dark-300">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center mt-12">
          <Link href="/order" className="btn-primary">
            Work with us
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}