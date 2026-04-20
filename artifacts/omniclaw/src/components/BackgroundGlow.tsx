import React from 'react';
import { motion } from 'framer-motion';

export function BackgroundGlow() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary opacity-20 blur-[100px]"></div>
      <div className="absolute right-0 top-[20%] -z-10 h-[250px] w-[250px] rounded-full bg-violet-600 opacity-10 blur-[100px]"></div>
      <div className="absolute left-[10%] bottom-[10%] -z-10 h-[300px] w-[300px] rounded-full bg-teal-600 opacity-10 blur-[100px]"></div>
    </div>
  );
}
