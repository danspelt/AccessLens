import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-center text-center">
        <h1 className="text-5xl font-bold mb-6">AccessLens</h1>
        <p className="text-xl text-gray-600 mb-8">
          Accessibility review platform for arenas, pools, rinks, parks, sidewalks, and businesses
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/explore"
            className="rounded-md bg-blue-600 px-6 py-3 text-lg font-medium text-white hover:bg-blue-700"
          >
            Explore Places
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-gray-100 px-6 py-3 text-lg font-medium text-gray-700 hover:bg-gray-200"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}

