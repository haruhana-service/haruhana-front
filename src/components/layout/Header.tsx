export function Header() {
  return (
    <header className="shrink-0 h-16 glass border-b border-white/40 flex items-center justify-between px-6 z-30 sticky top-0">
      <div className="mx-auto max-w-md lg:max-w-none w-full flex items-center justify-between">
        {/* Logo - 데스크톱에서는 Sidebar에 로고가 있으므로 숨김 */}
        <div className="flex items-center gap-2.5 cursor-pointer group lg:hidden">
          <div className="w-9 h-9 bg-haru-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-haru-600/25 group-hover:rotate-12 transition-transform">
            <span className="font-black text-lg">H</span>
          </div>
          <span className="font-extrabold text-xl text-slate-900 tracking-tight italic">haru:</span>
        </div>

        {/* User Icon */}
        <button className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 ml-auto">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>
    </header>
  )
}
