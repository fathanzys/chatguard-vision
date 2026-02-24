'use client';
export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-gray-900">ChatGuard Vision</h3>
            <p className="text-sm text-gray-500 mt-1">
              Sistem Audit Chat berbasis AI.
            </p>
          </div>
          <div className="flex gap-6 text-sm text-gray-500 font-medium">
            <span className="cursor-pointer hover:text-blue-600 transition">Privacy</span>
            <span className="cursor-pointer hover:text-blue-600 transition">Terms</span>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
          &copy; 2025 ChatGuard Team.
        </div>
      </div>
    </footer>
  );
}