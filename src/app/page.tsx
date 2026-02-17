import Link from 'next/link';
import { CheckCircle, MapPin, Star, Users, Shield, Search } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-green-200/30 blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-12">
          <div className="text-center lg:col-span-7 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-4 py-2 text-sm text-gray-700 shadow-sm backdrop-blur">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Community-powered accessibility info
            </div>

            <h1 className="mt-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
              Find places you can access —
              <span className="block text-blue-700">before you go</span>
            </h1>

            <p className="mt-6 max-w-2xl text-xl text-gray-600 sm:text-2xl">
              AccessLens helps you discover and review accessibility details for venues in your community.
              <span className="block mt-3 text-base text-gray-500">
                Step-free entry, accessible washrooms, parking, and real experiences from real people.
              </span>
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Link
                href="/explore"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
              >
                <MapPin className="h-5 w-5" />
                Explore places
              </Link>
              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 border-2 border-gray-200 sm:w-auto"
              >
                <Users className="h-5 w-5 text-gray-700" />
                Create account
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-white/70 p-5 shadow-sm ring-1 ring-gray-200/70 backdrop-blur">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Shield className="h-4 w-4 text-blue-700" />
                  Private by design
                </div>
                <p className="mt-2 text-sm text-gray-600">No tracking of your exact location in the database.</p>
              </div>
              <div className="rounded-xl bg-white/70 p-5 shadow-sm ring-1 ring-gray-200/70 backdrop-blur">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Star className="h-4 w-4 text-yellow-600" />
                  Real reviews
                </div>
                <p className="mt-2 text-sm text-gray-600">Shared by people who have actually been there.</p>
              </div>
              <div className="rounded-xl bg-white/70 p-5 shadow-sm ring-1 ring-gray-200/70 backdrop-blur">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Search className="h-4 w-4 text-green-700" />
                  Find what matters
                </div>
                <p className="mt-2 text-sm text-gray-600">Filter by accessibility features you care about.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Example venue</p>
                  <p className="mt-1 text-lg font-bold text-gray-900">Community Recreation Centre</p>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1 text-sm font-semibold text-yellow-700 ring-1 ring-yellow-200">
                  <Star className="h-4 w-4" />
                  4.6
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                  <span className="text-sm font-medium text-gray-900">Step-free entrance</span>
                  <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700 ring-1 ring-green-200">
                    Yes
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                  <span className="text-sm font-medium text-gray-900">Accessible washroom</span>
                  <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700 ring-1 ring-green-200">
                    Yes
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                  <span className="text-sm font-medium text-gray-900">Accessible parking</span>
                  <span className="rounded-full bg-yellow-50 px-3 py-1 text-sm font-semibold text-yellow-700 ring-1 ring-yellow-200">
                    Limited
                  </span>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-dashed border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
                “Clear entrance, but the ramp can be steep in winter. Staff were helpful.”
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Why AccessLens?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to find and share accessibility information
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl bg-gray-50 p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Easy Discovery</h3>
              <p className="mt-2 text-gray-600">
                Find accessible venues near you with powerful search and filtering options
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Detailed Reviews</h3>
              <p className="mt-2 text-gray-600">
                Read and write comprehensive reviews covering all accessibility features
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Community Driven</h3>
              <p className="mt-2 text-gray-600">
                Built by and for the community to share real accessibility experiences
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                <CheckCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Verified Information</h3>
              <p className="mt-2 text-gray-600">
                Real reviews from real people who have visited these places
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                <Users className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Inclusive Design</h3>
              <p className="mt-2 text-gray-600">
                Our platform is designed to be accessible to everyone
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                <Shield className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Trusted Platform</h3>
              <p className="mt-2 text-gray-600">
                Secure, reliable, and committed to accessibility advocacy
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Get started in three simple steps
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">Sign Up</h3>
              <p className="mt-2 text-gray-600">
                Create your free account to start exploring and contributing
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">Explore or Add</h3>
              <p className="mt-2 text-gray-600">
                Browse accessible venues or add new places to help others
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">Share & Review</h3>
              <p className="mt-2 text-gray-600">
                Write reviews and share your accessibility experiences
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Find Accessible Venues
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              We cover all types of places in your community
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Arenas', icon: '🏒' },
              { name: 'Pools', icon: '🏊' },
              { name: 'Rinks', icon: '⛸️' },
              { name: 'Parks', icon: '🌳' },
              { name: 'Sidewalks', icon: '🚶' },
              { name: 'Businesses', icon: '🏢' },
              { name: 'Restaurants', icon: '🍽️' },
              { name: 'More', icon: '➕' },
            ].map((category) => (
              <div
                key={category.name}
                className="rounded-lg border-2 border-gray-200 bg-white p-6 text-center transition-all hover:border-blue-500 hover:shadow-md"
              >
                <div className="text-4xl mb-2">{category.icon}</div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Help someone plan with confidence
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100">
            Add a place, leave a review, or simply browse. Every contribution makes accessibility information easier to find.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-700 shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 sm:w-auto"
            >
              <Users className="h-5 w-5" />
              Get started free
            </Link>
            <Link
              href="/explore"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-transparent px-8 py-4 text-lg font-semibold text-white border-2 border-white transition-all hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 sm:w-auto"
            >
              <MapPin className="h-5 w-5" />
              Browse places
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
