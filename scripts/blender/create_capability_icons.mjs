// Reuse the project's installed icon library; no network assets or new packages.
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as si from 'react-icons/si';
import { FaAws } from 'react-icons/fa6';
import { VscVscode } from 'react-icons/vsc';
import { LuCode } from 'react-icons/lu';
import fs from 'node:fs/promises';
import sharp from 'sharp';
const icons={react:si.SiReact,nextjs:si.SiNextdotjs,redux:si.SiRedux,css:si.SiCss,tailwindcss:si.SiTailwindcss,nodejs:si.SiNodedotjs,express:si.SiExpress,nestjs:si.SiNestjs,bun:si.SiBun,postgresql:si.SiPostgresql,prisma:si.SiPrisma,mongodb:si.SiMongodb,redis:si.SiRedis,docker:si.SiDocker,aws:FaAws,vercel:si.SiVercel,threejs:si.SiThreedotjs,git:si.SiGit,github:si.SiGithub,vscode:VscVscode,figma:si.SiFigma,supabase:si.SiSupabase,javascript:si.SiJavascript,typescript:si.SiTypescript,unknown:LuCode};
for(const [name,Icon] of Object.entries(icons)){
 const svg=renderToStaticMarkup(React.createElement(Icon,{size:256,color:'#bfdbe7'}));
 await fs.writeFile(`public/icons/capability/${name}.svg`,svg);
 await sharp(Buffer.from(svg)).png().toFile(`.qa/capability-icons/${name}.png`);
}
