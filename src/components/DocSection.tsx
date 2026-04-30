"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FaDownload, 
  FaFilePdf, 
  FaCertificate, 
  FaUserGraduate, 
  FaFileAlt,
  FaFileSignature 
} from "react-icons/fa";

// Interface disesuaikan dengan skema backend Prisma/Cloudinary kamu
interface DocumentData {
  id: string;
  name: string;
  category: string;
  size: number;
  fileUrl: string;
  createdAt: string;
}

export default function DocSection() {
  const [docs, setDocs] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${API_URL}/api/documents`);
        const result = await response.json();
        if (result.success) {
          setDocs(result.data);
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, []);

  // Format Size (Bytes ke KB/MB)
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Pilih Ikon berdasarkan kategori dari DB
  const getIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'certificate': return <FaCertificate size={16} />;
      case 'education': return <FaUserGraduate size={16} />;
      case 'resume': return <FaFileSignature size={16} />;
      default: return <FaFilePdf size={16} />;
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div className="w-1/2 h-full bg-blue-600 animate-[loading_1s_ease-in-out_infinite]" />
      </div>
      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Accessing Vault...</span>
    </div>
  );

  return (
    <section id="documents" className="relative w-full max-w-5xl mx-auto py-24 px-6">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-600/5 blur-[120px] pointer-events-none" />

      <div className="relative space-y-12">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded-sm">Public</span>
              <div className="w-12 h-px bg-zinc-800" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic">
              Credential <span className="text-zinc-700 not-italic">&</span> Assets<span className="text-blue-600">.</span>
            </h2>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
              {docs.length} verified files
            </span>
          </div>
        </div>

        {/* GRID DOKUMEN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docs.map((doc, i) => (
            <motion.a
              key={doc.id}
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative flex items-center justify-between p-5 bg-[#0d0d0d] border border-white/5 rounded-2xl hover:border-blue-500/50 hover:bg-[#111111] transition-all duration-300 overflow-hidden"
            >
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-linear-to-r from-blue-600/0 via-blue-600/0 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center gap-5 relative z-10">
                {/* ICON BOX */}
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 group-hover:text-blue-500 group-hover:border-blue-500/30 transition-all duration-500">
                  {getIcon(doc.category)}
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-white text-sm font-bold uppercase tracking-tight group-hover:text-blue-400 transition-colors">
                    {doc.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                      {doc.category}
                    </span>
                    <span className="text-[9px] text-zinc-600 font-mono">
                      {formatSize(doc.size)}
                    </span>
                  </div>
                </div>
              </div>

              {/* DOWNLOAD ACTION */}
              <div className="relative z-10 flex items-center">
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-600 group-hover:border-blue-500 group-hover:text-blue-500 transition-all duration-500 group-hover:rotate-360">
                  <FaDownload size={12} />
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* FOOTER FOOTNOTE */}
        <div className="flex flex-col items-center gap-4 pt-12">
          <div className="w-full h-px bg-linear-to-r from-transparent via-zinc-800 to-transparent" />
          <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.4em] text-center leading-loose">
            Digitally Signed • Encrypted Transport • Nexxus Verified Assets
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </section>
  );
}
