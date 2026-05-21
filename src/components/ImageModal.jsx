import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, Download, ExternalLink } from 'lucide-react';

export default function ImageModal({ imageUrl, isOpen, onClose }) {
  if (!isOpen || !imageUrl) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
        {/* Darkened blur overlay background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-zoom-out"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative max-w-5xl w-full bg-white border border-slate-200 rounded-xl overflow-hidden z-10 flex flex-col shadow-xl"
        >
          {/* Header Action Bar */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                INSPECT_ATTACHMENT_VIEW
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <a
                href={imageUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1 hover:text-slate-800 text-slate-400 transition-colors"
                title="Open original image"
              >
                <ExternalLink className="w-4 h-4 stroke-[1.5]" />
              </a>
              <button
                onClick={onClose}
                className="p-1 hover:text-slate-800 text-slate-400 transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5 stroke-[1.5]" />
              </button>
            </div>
          </div>

          {/* Large Image display area */}
          <div className="flex-1 flex justify-center items-center bg-slate-50 p-6 max-h-[75vh]">
            <img
              src={imageUrl}
              alt="Inspected diagnostic attachment"
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain border border-slate-200 rounded-lg shadow-sm selection:bg-transparent"
            />
          </div>

          {/* Details Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center text-slate-400 font-mono text-[10px]">
            <span>SCALE: 100%</span>
            <span>SECURE LINK ENCRYPTION PROTOCOL ACTIVE</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
