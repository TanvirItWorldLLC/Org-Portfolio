import { Scene3D } from '../components/three/Scene3D'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle, Zap, Globe, Layers, MousePointer } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Real-time 3D Rendering',
    description: 'Powered by Three.js and React Three Fiber for buttery-smooth 60fps experiences.',
  },
  {
    icon: Globe,
    title: 'Cross-platform Compatible',
    description: 'Works seamlessly across desktop, mobile, and VR devices with progressive enhancement.',
  },
  {
    icon: Layers,
    title: 'Layered Architecture',
    description: 'Clean separation of concerns with reusable components and composable scenes.',
  },
  {
    icon: MousePointer,
    title: 'Interactive Controls',
    description: 'Orbit, pan, zoom, and custom interactions with physics-based animations.',
  },
]

const stats = [
  { value: '150+', label: 'Projects Delivered' },
  { value: '50+', label: 'Happy Clients' },
  { value: '12', label: 'Team Members' },
  { value: '98%', label: 'Client Satisfaction' },
]

const techStack = [
  'React', 'Three.js', 'React Three Fiber', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL', 'Docker', 'WebGL', 'GSAP'
]

export default function Home() {
  return (
    <>
      <Scene3D />
      
      <section className="relative z-10 py-20 lg:py-32 bg-white dark:bg-dark-950">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-dark-900 dark:text-white mb-6">
              Why Choose <span className="gradient-text"> Org Portfolio</span>?
            </h2>
            <p className="text-lg text-dark-600 dark:text-dark-300 leading-relaxed">
              We combine cutting-edge 3D technology with thoughtful design to create digital experiences that don't just look amazing—they perform.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card group hover:border-primary-200 dark:hover:border-primary-800"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                  <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-dark-600 dark:text-dark-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="relative z-10 py-20 lg:py-32 bg-dark-50 dark:bg-dark-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-dark-900 dark:text-white mb-6">
              Our <span className="gradient-text">Impact</span> in Numbers
            </h2>
            <p className="text-lg text-dark-600 dark:text-dark-300 leading-relaxed">
              Delivering measurable results for businesses worldwide through innovative 3D web solutions.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-dark-600 dark:text-dark-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="relative z-10 py-20 lg:py-32 bg-white dark:bg-dark-950">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-dark-900 dark:text-white mb-6">
              Technology <span className="gradient-text">Stack</span>
            </h2>
            <p className="text-lg text-dark-600 dark:text-dark-300 leading-relaxed">
              We use modern, battle-tested technologies to build robust and scalable 3D web applications.
            </p>
          </motion.div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech, index) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-700 dark:text-dark-300 text-sm font-medium border border-dark-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors cursor-default"
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </div>
      </section>
      
      <section className="relative z-10 py-20 lg:py-32 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Build Something <span className="text-primary-200">Amazing</span>?
            </h2>
            <p className="text-lg text-primary-100 max-w-2xl mx-auto mb-10 leading-relaxed">
              Let's collaborate on your next 3D project. From concept to launch, we're here to bring your vision to life.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/order" className="btn bg-white text-primary-600 hover:bg-primary-50 px-8 py-3 text-base">
                Start Your Project
                <ArrowRight className="w-5 h-5" />
              </a>
              <a href="/contact" className="btn border-2 border-white text-white hover:bg-white/10 px-8 py-3 text-base">
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}