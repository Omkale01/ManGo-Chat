function Loader() {
  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-4 border-purple-500/30 border-b-purple-500 rounded-full animate-spin-reverse"></div>

        <p className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-cyan-400 font-semibold whitespace-nowrap animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}

export default Loader;
