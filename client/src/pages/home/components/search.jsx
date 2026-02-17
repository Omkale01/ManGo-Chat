function Search({ searchKey, setSearchKey }) {
  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Search..."
        value={searchKey}
        onChange={(e) => setSearchKey(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-gray-400 focus:bg-slate-800 focus:border-orange-500 focus:outline-none transition-all"
      />
      <img
        src="/images/search-person.png"
        alt="Search"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
      />
    </div>
  );
}

export default Search;
