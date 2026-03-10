import { notFound, redirect } from 'next/navigation';
import { getPlacePath } from '@/lib/accesslens/constants';
import { getPlaceById } from '@/lib/accesslens/data';

interface PlacePageProps {
  params: Promise<{ id: string }>;
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { id } = await params;
  const place = await getPlaceById(id);

  if (!place) {
    notFound();
  }

  redirect(getPlacePath(place));
}

