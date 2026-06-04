import Link from 'next/link';

export default function SubmitSuccessPage() {
  return (
    <div className="min-h-[calc(100vh-112px)] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-[9px] uppercase tracking-superwide text-neutral-500 mb-4">
          &gt; CS322 / Submit
        </p>
        <h1 className="font-instrument-serif text-4xl text-neutral-900 mb-4">
          Submission Received
        </h1>
        <p className="font-sans text-sm text-neutral-500 mb-8 leading-relaxed">
          Your project has been submitted and is pending review. It will appear in the gallery once approved by the course instructors.
        </p>
        <Link
          href="/"
          className="inline-block bg-brand-700 hover:bg-brand-600 text-white font-mono text-[10px] uppercase tracking-superwide px-6 py-3 transition-colors"
        >
          Back to Gallery
        </Link>
      </div>
    </div>
  );
}
