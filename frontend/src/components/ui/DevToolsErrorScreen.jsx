export default function DevToolsErrorScreen() {
  return (
    <div className="fixed inset-0 z-[999999] bg-[#0a0a0a] flex items-center justify-center h-screen w-screen overflow-hidden pointer-events-none select-none">
      <div className="text-center px-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-200 tracking-wide font-sans">
          Oops, something went wrong.
        </h1>
      </div>
    </div>
  );
}
