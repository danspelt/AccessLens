import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <nav className="border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 flex-col justify-center gap-4 py-4 md:h-16 md:flex-row md:items-center md:justify-between md:py-0">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-gray-900">
              AccessLens
            </Link>
            <div className="ml-6 hidden items-baseline space-x-4 md:flex">
              <Link
                href="/victoria-bc"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Victoria
              </Link>
              <Link
                href="/explore"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Explore
              </Link>
              {user && (
                <>
                  <Link
                    href="/dashboard"
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/add-place"
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Add Place
                  </Link>
                  <Link
                    href="/upload"
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Upload Evidence
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 md:justify-end">
            <div className="flex items-center gap-2 md:hidden">
              <Link
                href="/victoria-bc"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Victoria
              </Link>
              <Link
                href="/explore"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Explore
              </Link>
            </div>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">{user.name}</span>
                <form action="/api/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                  >
                    Logout
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

