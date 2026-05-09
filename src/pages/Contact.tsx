import { motion } from "motion/react";

export function Contact() {
  return (
    <div className="min-h-screen pt-32 px-4 md:px-8 pb-12 flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl glass-card rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-pink/10 rounded-full blur-[80px]" />
        
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-white text-gradient">Get In Touch</h1>
        <p className="text-gray-400 mb-10 font-light text-lg">
          Have a question about our premium assets? Need help with an order? Drop us a message below.
        </p>

        <form className="space-y-6 text-left relative z-10">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Your Email</label>
            <input 
              type="email" 
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-purple transition-colors"
              placeholder="hello@creator.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Message</label>
            <textarea 
              rows={4}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-purple transition-colors resize-none"
              placeholder="How can we help?"
            ></textarea>
          </div>
          <button 
            type="button"
            className="w-full py-4 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink text-white font-bold tracking-wide uppercase shadow-[0_0_20px_rgba(255,42,133,0.3)] hover:shadow-[0_0_30px_rgba(255,42,133,0.6)] transition-shadow"
          >
            Send Message
          </button>
        </form>
      </motion.div>
    </div>
  );
}
