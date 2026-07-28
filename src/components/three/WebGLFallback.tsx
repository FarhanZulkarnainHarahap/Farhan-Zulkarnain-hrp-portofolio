export default function WebGLFallback() {
  return (
    <div className="relative grid h-full min-h-72 place-items-center overflow-hidden rounded-[28px] border border-blue-400/18 bg-[#070b13]/72">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(59,130,246,0.22),transparent_45%)]" />
      <div className="relative h-42 w-42 rounded-full border border-blue-300/40 bg-blue-500/10 shadow-[0_0_60px_rgba(37,99,235,0.28)]">
        <span className="absolute inset-8 rounded-full border border-cyan-200/25" />
        <span className="absolute left-1/2 top-1/2 font-mono text-3xl font-black text-white -translate-x-1/2 -translate-y-1/2">
          FZH
        </span>
      </div>
    </div>
  );
}
