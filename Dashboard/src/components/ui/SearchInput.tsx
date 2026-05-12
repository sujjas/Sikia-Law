export function SearchInput({
  placeholder = "Search notes, course units, or topics",
  kbd = "⌘K",
  className = "",
}: {
  placeholder?: string;
  kbd?: string;
  className?: string;
}) {
  return (
    <label
      className={`flex items-center gap-2.5 bg-white border border-[var(--line)] rounded-md focus-within:border-stone-900 transition-colors ${className}`}
      style={{
        paddingInline: "var(--search-px)",
        paddingBlock: "var(--search-py)",
      }}
    >
      <input
        type="text"
        placeholder={placeholder}
        className="flex-1 border-0 outline-none bg-transparent font-sans text-[0.9rem] text-stone-900 placeholder:text-stone-500"
      />
      {kbd && (
        <span className="font-mono text-mono-sm px-1.5 py-0.5 rounded-sm bg-stone-100 border border-[var(--line-2)] text-stone-500">
          {kbd}
        </span>
      )}
    </label>
  );
}
