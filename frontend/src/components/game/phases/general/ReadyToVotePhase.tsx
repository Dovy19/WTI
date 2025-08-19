'use client';

import { motion } from 'framer-motion';
import FadeInText from '../shared/FadeInText';

export default function ReadyToVotePhase() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center h-full"
    >
      <div className="text-center">
        <FadeInText 
          text="Time to vote..." 
          delay={0.2}
          size="large"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 1, type: "spring" }}
          className="mt-8"
        >
          <div className="inline-flex items-center px-8 py-4 bg-red-500/20 rounded-lg border border-red-500/30">
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-4xl mr-4"
            >
              🕵️
            </motion.div>
            <span className="text-red-300 font-bold text-2xl">
              Who is the impostor?
            </span>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="text-white/80 text-lg mt-6"
        >
          Discuss and vote carefully...
        </motion.p>

        {/* Voting hint animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.8 }}
          className="mt-6 flex justify-center space-x-2"
        >
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                delay: i * 0.2 
              }}
              className="w-3 h-3 bg-red-400 rounded-full"
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}