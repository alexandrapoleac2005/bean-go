import { Link } from 'react-router'

// Placeholder for role areas that are guarded but not built yet.
export function ComingSoonPage({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-28">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-5 max-w-[16ch] text-headline">{title}</h1>
      <p className="mt-6 max-w-md text-[15px] text-muted">This space is being roasted. Check back soon.</p>
      <Link
        to="/"
        className="mt-10 inline-block text-sm font-medium underline decoration-espresso/40 decoration-1 underline-offset-4"
      >
        Back to the map
      </Link>
    </div>
  )
}
