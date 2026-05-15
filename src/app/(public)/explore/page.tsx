import { redirect } from 'next/navigation';

interface ExploreRedirectProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ExploreRedirectPage({ searchParams }: ExploreRedirectProps) {
  const sp = await searchParams;
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === 'string') {
      q.set(key, value);
    } else if (Array.isArray(value)) {
      for (const v of value) {
        if (typeof v === 'string') q.append(key, v);
      }
    }
  }
  const suffix = q.toString() ? `?${q.toString()}` : '';
  redirect(`/places${suffix}`);
}
