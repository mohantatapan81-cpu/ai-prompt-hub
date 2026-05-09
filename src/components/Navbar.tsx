import { motion } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "AI Prompts", path: "/category/ai-prompts" },
  { name: "Lightroom Presets", path: "/category/presets" },
  { name: "Reels Templates", path: "/category/reels" },
  { name: "About", path: "/about" },
  { name: "Contact Us", path: "/contact" },
  { name: "Admin", path: "/admin" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-x-0 border-t-0 rounded-none bg-black/40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neon-blue via-neon-purple to-neon-pink flex items-center justify-center shadow-[0_0_15px_rgba(138,43,226,0.5)] group-hover:shadow-[0_0_25px_rgba(255,42,133,0.6)] text-white"
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
            <span className="font-display font-bold text-xl tracking-wide text-white">
              AI Prompt Hub
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-all duration-300 hover:text-white uppercase tracking-wider relative group",
                  location.pathname === link.path ? "text-white" : "text-gray-400"
                )}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-2 left-0 right-0 h-[2px] bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      <motion.div
        initial={false}
        animate={{
          opacity: isOpen ? 1 : 0,
          y: isOpen ? 0 : "-100%",
        }}
        className={cn(
          "fixed inset-0 z-40 bg-dark-bg/95 backdrop-blur-xl pt-24 px-6 lg:hidden flex flex-col gap-6",
          !isOpen && "pointer-events-none"
        )}
      >
        {navLinks.map((link, i) => (
          <motion.div
            key={link.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : -20 }}
            transition={{ delay: isOpen ? i * 0.1 : 0 }}
          >
            <Link
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={cn(
                "block text-2xl font-display font-semibold tracking-wide py-4 border-b border-white/5",
                location.pathname === link.path
                  ? "neon-gradient-text"
                  : "text-gray-400 hover:text-white"
              )}
            >
              {link.name}
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}
