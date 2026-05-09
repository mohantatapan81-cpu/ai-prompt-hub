import { motion } from "motion/react";

export function About() {
  return (
    <div className="min-h-screen pt-32 px-4 md:px-8 pb-12 flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl max-auto text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
          <span className="text-sm font-medium tracking-wide uppercase text-gray-300">
            About Us
          </span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight mb-8">
          Empowering Creators <br />
          <span className="neon-gradient-text">Worldwide</span>
        </h1>
        
        <p className="text-xl text-gray-400 leading-relaxed font-light mx-auto max-w-2xl mb-12">
          AI Prompt Hub was founded with a single mission: to provide creators with the highest quality assets to level up their content instantly. Whether you need Midjourney prompts, cinematic Lightroom presets, or viral Reels sequences, we've got you covered.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
           {[
             { num: "50K+", label: "Creators" },
             { num: "10K+", label: "Premium Assets" },
             { num: "1M+", label: "Downloads" }
           ].map((stat, i) => (
             <div key={i} className="glass-card rounded-2xl p-8 border-t-2 border-t-neon-blue text-center">
               <div className="text-4xl font-display font-black text-white mb-2">{stat.num}</div>
               <div className="text-sm uppercase tracking-wider text-gray-400">{stat.label}</div>
             </div>
           ))}
        </div>
      </motion.div>
    </div>
  );
}
