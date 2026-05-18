import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-purple-500 flex items-center justify-center mx-auto mb-6">
          <Layers size={28} className="text-white" />
        </div>
        <h1 className="text-6xl font-bold gradient-text-accent mb-4" style={{ fontFamily: 'var(--font-heading)' }}>404</h1>
        <p className="text-lg text-[var(--color-text-secondary)] mb-8">Page not found</p>
        <Link to="/" className="px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg font-medium transition-all text-sm hover:shadow-lg hover:shadow-[var(--color-accent)]/20">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
