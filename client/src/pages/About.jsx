import { motion } from 'framer-motion'
import { Users, Award, Target, Heart, Code, Globe, Zap, Layers } from 'lucide-react'
import { Scene3D } from '../components/three/Scene3D'

const values = [
  {
    icon: Heart,
    title: 'Craftsmanship',
    description: 'We obsess over every pixel and polygon, ensuring exceptional quality in every detail.',
  },
  {
    icon: Zap,
    title: 'Innovation',
    description: 'Pushing the boundaries of what\'s possible on the web with cutting-edge 3D technology.',
  },
  {
    icon: Users,
    title: 'Collaboration',
    description: 'Working closely with clients as partners, not vendors, to bring visions to life.',
  },
  {
    icon: Target,
    title: 'Results-Driven',
    description: 'Beautiful experiences that convert—measurable impact for your business.',
  },
]

const team = [
  {
    name: 'Sarah Chen',
    role: 'Founder & Creative Director',
    bio: '15+ years in digital design, previously at Google Creative Lab. Passionate about the intersection of art and technology.',
    image: null,
    social: { twitter: '#', linkedin: '#', dribbble: '#' },
  },
  {
    name: 'Marcus Johnson',
    role: 'Lead 3D Engineer',
    bio: 'WebGL expert and Three.js contributor. Built rendering engines for AAA games before falling in love with the web.',
    image: null,
    social: { twitter: '#', linkedin: '#', github: '#' },
  },
  {
    name: 'Emily Rodriguez',
    role: 'Senior Developer',
    bio: 'Full-stack developer specializing in React and Node.js. Advocate for clean code and developer experience.',
    image: null,
    social: { twitter: '#', linkedin: '#', github: '#' },
  },
  {
    name: 'David Park',
    role: 'Motion Designer',
    bio: 'Award-winning motion designer bringing static 3D to life. Believes every interaction should tell a story.',
    image: null,
    social: { twitter: '#', linkedin: '#', dribbble: '#' },
  },
]

const milestones = [
  { year: '2020', title: 'Founded', description: 'Started as a small studio with a big vision for 3D web.' },
  { year: '2021', title: 'First Major Client', description: 'Landed our first enterprise client, a Fortune 500 company.' },
  { year: '2022', title: 'Team Expansion', description: 'Grew to 12 team members across design, engineering, and strategy.' },
  { year: '2023', title: 'Award Recognition', description: 'Won 3 Awwwards Site of the Day and 1 FWA of the Day.' },
  { year: '2024', title: 'Global Reach', description: 'Delivered projects for clients in 20+ countries worldwide.' },
]

export default function About() {
  return (
    <>
      <Scene3D className="opacity-50" />
      
      <div className="relative z-10 min-h-screen bg-white/50 dark:bg-dark-950/50 backdrop-blur-sm">
        <div className="container-custom py-16 lg:py-24">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-24"
          >
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-dark-900 dark:text-white mb-6">
                About <span className="gradient-text">Org Portfolio</span>
              </h1>
              <p className="text-lg text-dark-600 dark:text-dark-300 leading-relaxed">
                We're a team of designers, engineers, and dreamers crafting the future of 3D web experiences.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="card p-8"
              >
                <h3 className="text-2xl font-bold text-dark-900 dark:text-white mb-4">Our Story</h3>
                <div className="prose dark:prose-invert max-w-none text-dark-600 dark:text-dark-300">
                  <p className="mb-4">
                    Founded in 2020, Org Portfolio was born from a simple belief: the web should be more immersive, more interactive, and more beautiful. What started as a passion project between two developers has grown into a full-service digital studio.
                  </p>
                  <p className="mb-4">
                    We've had the privilege of working with startups, agencies, and global brands—helping them tell their stories through the power of three-dimensional design. Every project is an opportunity to push the medium forward.
                  </p>
                  <p>
                    Today, we're a diverse team of 12 creators spread across the globe, united by our love for the craft and our commitment to excellence.
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="card p-8"
              >
                <h3 className="text-2xl font-bold text-dark-900 dark:text-white mb-4">Our Mission</h3>
                <div className="prose dark:prose-invert max-w-none text-dark-600 dark:text-dark-300">
                  <p className="mb-4">
                    To democratize 3D web experiences and make them accessible to businesses of all sizes. We believe that immersive digital experiences shouldn't be reserved for tech giants with massive budgets.
                  </p>
                  <p className="mb-4">
                    Through our work, we aim to elevate the standard of web design, inspire the next generation of creators, and prove that technology and artistry can coexist harmoniously.
                  </p>
                  <p>
                    We measure our success not just by awards won, but by the tangible results our clients achieve—increased engagement, higher conversions, and stronger brand connections.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.section>
          
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-24"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-dark-900 dark:text-white mb-4">
                Our <span className="gradient-text">Values</span>
              </h2>
              <p className="text-lg text-dark-600 dark:text-dark-300 max-w-2xl mx-auto">
                The principles that guide every decision we make and every project we touch.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="card group hover:border-primary-200 dark:hover:border-primary-800"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                    <value.icon className="w-6 h-6 text-primary-600 dark:text-primary-400 group-hover:text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">{value.title}</h3>
                  <p className="text-dark-600 dark:text-dark-400">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
          
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-24"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-dark-900 dark:text-white mb-4">
                Meet the <span className="gradient-text">Team</span>
              </h2>
              <p className="text-lg text-dark-600 dark:text-dark-300 max-w-2xl mx-auto">
                A diverse group of passionate creators pushing the boundaries of 3D web.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="card"
                >
                  <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-700/20 flex items-center justify-center mb-6 relative overflow-hidden">
                    <Users className="w-16 h-16 text-primary-500/50" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <div className="flex gap-2 w-full justify-center">
                        {member.social.twitter && (
                          <a href={member.social.twitter} target="_blank" rel="noopener" className="w-8 h-8 rounded-full bg-white/90 backdrop-blur text-dark-900 flex items-center justify-center hover:bg-white transition-colors text-sm">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
                          </a>
                        )}
                        {member.social.linkedin && (
                          <a href={member.social.linkedin} target="_blank" rel="noopener" className="w-8 h-8 rounded-full bg-white/90 backdrop-blur text-dark-900 flex items-center justify-center hover:bg-white transition-colors text-sm">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                          </a>
                        )}
                        {member.social.github && (
                          <a href={member.social.github} target="_blank" rel="noopener" className="w-8 h-8 rounded-full bg-white/90 backdrop-blur text-dark-900 flex items-center justify-center hover:bg-white transition-colors text-sm">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                          </a>
                        )}
                        {member.social.dribbble && (
                          <a href={member.social.dribbble} target="_blank" rel="noopener" className="w-8 h-8 rounded-full bg-white/90 backdrop-blur text-dark-900 flex items-center justify-center hover:bg-white transition-colors text-sm">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.827 1.92-2.165 3.483-3.898 4.464-1.734.984-3.597 1.473-5.521 1.473-3.389 0-6.256-1.141-8.574-3.423C.147 17.498 0 14.59 0 12s.147-5.498.444-8.143A11.89 11.89 0 015.541.69c1.924-.49 3.787-.232 5.521.723 1.734.954 3.194 2.612 3.898 4.53.704 1.92-1.09 3.462-2.944 3.752-1.09.173-2.18.26-3.27.26s-2.18-.087-3.27-.26c-1.854-.29-3.648-1.832-2.944-3.752.704-1.918 2.164-3.576 3.898-4.53 1.734-.955 3.597-.743 5.521-.26 3.47 1.065 6.208 3.832 6.885 7.412.046.226.069.452.069.678 0 3.094-1.683 5.835-4.328 7.32zm-4.04-10.812c.854-1.749 2.226-3.245 3.898-4.324 1.957-1.243 4.135-1.828 6.236-1.828 3.39 0 6.257 1.14 8.575 3.423.207.205.389.435.548.688-.069.138-.161.276-.276.414-1.034 1.516-2.757 2.757-4.756 3.446-1.998.689-4.134 1.033-6.348 1.033-2.213 0-4.351-.345-6.349-1.033-1.999-.689-3.722-1.93-4.756-3.446-.069-.138-.161-.276-.276-.414.138-.253.32-.483.517-.689 2.317-2.282 5.184-3.422 8.574-3.422 2.101 0 4.279.586 6.236 1.828 1.672 1.079 3.044 2.575 3.898 4.324.759 1.55-.966 3.102-2.62 3.379-1.724.276-3.517.138-5.309-.138-1.862-.276-3.655-.62-5.309-.138-1.655.276-3.379 1.828-2.621 3.379z"/></svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-1">{member.name}</h3>
                  <p className="text-sm text-primary-600 dark:text-primary-400 mb-4">{member.role}</p>
                  <p className="text-sm text-dark-600 dark:text-dark-400">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
          
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-24"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-dark-900 dark:text-white mb-4">
                Our <span className="gradient-text">Journey</span>
              </h2>
              <p className="text-lg text-dark-600 dark:text-dark-300 max-w-2xl mx-auto">
                Key milestones that shaped who we are today.
              </p>
            </div>
            
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 to-primary-700 -translate-x-1/2" />
              
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={milestone.year}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`relative flex items-start gap-6 ${index % 2 === 1 ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`flex-1 ${index % 2 === 1 ? 'text-right pr-6' : 'pl-6'}`}>
                      <div className="absolute left-1/2 top-2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary-500 border-4 border-white dark:border-dark-950 z-10" />
                      <div className="card">
                        <div className="text-sm font-bold text-primary-600 dark:text-primary-400 mb-1">{milestone.year}</div>
                        <h4 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">{milestone.title}</h4>
                        <p className="text-dark-600 dark:text-dark-400">{milestone.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
          
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="card bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-12 lg:p-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Want to Join Our Team?</h2>
              <p className="text-lg text-primary-100 max-w-xl mx-auto mb-8">
                We're always looking for talented individuals who share our passion for 3D web experiences.
              </p>
              <a href="/contact" className="btn bg-white text-primary-600 hover:bg-primary-50 px-8 py-3 text-base">
                View Open Positions
              </a>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  )
}