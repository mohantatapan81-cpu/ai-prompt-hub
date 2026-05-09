import { motion } from "motion/react";
import { useEffect, useState } from "react";

export function Background() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
    
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (dimensions.width === 0) return null;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-dark-bg">
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-dark-bg/50 via-dark-bg to-dark-bg/90 z-0"></div>

      {/* Floating Blur Lights - Fixed positioned */}
      <motion.div
        animate={{
          x: [0, 100, 0, -100, 0],
          y: [0, 50, -50, 0, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-neon-purple/20 blur-[120px]"
      />
      <motion.div
        animate={{
          x: [0, -100, 0, 100, 0],
          y: [0, -50, 50, 0, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-neon-blue/20 blur-[150px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[30%] left-[40%] w-[30vw] h-[30vw] rounded-full bg-neon-pink/10 blur-[100px]"
      />

      {/* Particles */}
      {[...Array(30)].map((_, i) => {
        const size = Math.random() * 4 + 1;
        const initialX = Math.random() * dimensions.width;
        const initialY = Math.random() * dimensions.height;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * -20;
        
        return (
          <motion.div
            key={i}
            initial={{ x: initialX, y: initialY, opacity: 0 }}
            animate={{
              y: [initialY, initialY - Math.random() * 300 - 100],
              x: [initialX, initialX + Math.random() * 100 - 50],
              opacity: [0, Math.random() * 0.5 + 0.2, 0],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute rounded-full bg-white blur-[1px]"
            style={{ width: size, height: size }}
          />
        );
      })}
    </div>
  );
}
