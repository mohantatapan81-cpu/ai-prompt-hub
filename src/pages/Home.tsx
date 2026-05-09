import { motion } from "motion/react";
import { Sparkles, Camera, Film } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  {
    id: "ai-prompts",
    title: "AI Prompts",
    description: "Master Midjourney, ChatGPT & DALL-E with professional prompts.",
    icon: Sparkles,
    color: "from-[#ff2a85] to-[#ff758c]",
    shadow: "group-hover:shadow-[0_0_40px_rgba(255,42,133,0.4)]",
    border: "group-hover:border-[#ff2a85]/50",
    isNew: true,
  },
  {
    id: "presets",
    title: "Lightroom Presets",
    description: "Transform your photos instantly with premium cinematic looks.",
    icon: Camera,
    color: "from-[#8a2be2] to-[#b82eff]",
    shadow: "group-hover:shadow-[0_0_40px_rgba(138,43,226,0.4)]",
    border: "group-hover:border-[#8a2be2]/50",
    isNew: false,
  },
  {
    id: "reels",
    title: "Reels Templates",
    description: "Go viral with high-converting trending video templates.",
    icon: Film,
    color: "from-[#00e5ff] to-[#009dff]",
    shadow: "group-hover:shadow-[0_0_40px_rgba(0,229,255,0.4)]",
    border: "group-hover:border-[#00e5ff]/50",
    isNew: true,
  },
];

export function Home() {
  return (
    <div className="min-h-screen pt-20 flex flex-col justify-center items-center px-4 md:px-8 pb-12">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center max-w-4xl mx-auto mb-16 mt-8"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-neon-pink animate-pulse"></span>
          <span className="text-sm font-medium tracking-wide uppercase text-gray-300">
            Premium Creator Platform
          </span>
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight mb-6">
          Unleash Your <br className="hidden md:block" />
          <span className="neon-gradient-text">Creative Potential</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light">
          The ultimate hub for next-generation creators. Elevate your content with exclusive AI prompts, professional presets, and viral video templates.
        </p>
      </motion.div>

      {/* The 3 Cards */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
        {categories.map((category, idx) => {
          const Icon = category.icon;
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.15, duration: 0.7, ease: "easeOut" }}
            >
              <Link to={`/category/${category.id}`} className="block group h-full">
                <div
                  className={`relative h-full p-8 rounded-3xl glass-card transition-all duration-500 hover:-translate-y-2 ${category.shadow} ${category.border} overflow-hidden`}
                >
                  {/* Card Background Glow */}
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${category.color}`}
                  />
                  
                  {/* Viral Badge */}
                  {category.isNew && (
                    <div className="absolute top-6 right-6 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center gap-1.5 shadow-lg">
                      <div className="w-1.5 h-1.5 rounded-full bg-neon-pink animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white">Viral / New</span>
                    </div>
                  )}

                  <div className={`w-16 h-16 mb-8 rounded-2xl flex items-center justify-center bg-gradient-to-br ${category.color} shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-display font-bold mb-4 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-colors duration-300">
                    {category.title}
                  </h3>
                  
                  <p className="text-gray-400 font-light leading-relaxed group-hover:text-gray-300 transition-colors">
                    {category.description}
                  </p>
                  
                  {/* Decorator arrow */}
                  <div className="mt-8 flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-white/50 group-hover:text-white transition-colors duration-300">
                    <span>Explore Collection</span>
                    <motion.div
                      className="inline-block"
                      whileHover={{ x: 5 }}
                    >
                      &rarr;
                    </motion.div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
