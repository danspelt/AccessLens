import { notFound, redirect } from 'next/navigation';
import { findPlaceByAccessCode, serializePlaceForBusiness } from '@/lib/db/placesByAccessCode';
import { normalizeAccessCode, isValidAccessCodeFormat } from '@/lib/access/codeFormat';
import { BusinessAccessWizard } from '@/components/business/BusinessAccessWizard';
import { setBusinessAccessSession } from '@/lib/business/session';

interface Props {
  params: Promise<{ code: string }>;
}

export default async function UpdateAccessibilityWizardPage({ params }: Props) {
  const { code: raw } = await params;
  const code = normalizeAccessCode(raw);

  if (!isValidAccessCodeFormat(code)) {
    redirect('/update-accessibility');
  }

  const place = await findPlaceByAccessCode(code);
  if (!place) {
    notFound();
  }

  await setBusinessAccessSession(place._id.toString(), code);

  return <BusinessAccessWizard code={code} initialPlace={serializePlaceForBusiness(place)} />;
}
