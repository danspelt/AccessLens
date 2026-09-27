import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { isSponsorTier, priceIdForTier, stripeConfigured } from '@/lib/sponsorship';
import { clientIp, rateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  if (!stripeConfigured()) {
    return NextResponse.json({ error: 'Sponsorship checkout is not available yet.' }, { status: 503 });
  }

  if (!rateLimit(`sponsor-checkout:${clientIp(request)}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a minute.' }, { status: 429 });
  }

  const body = (await request.json().catch(() => ({}))) as { tier?: unknown };
  if (!isSponsorTier(body.tier)) {
    return NextResponse.json({ error: 'Choose a valid sponsorship tier.' }, { status: 400 });
  }

  const priceId = priceIdForTier(body.tier);
  if (!priceId) {
    return NextResponse.json({ error: 'That sponsorship tier is not available.' }, { status: 400 });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    const origin = request.headers.get('origin') ?? new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/sponsor/thanks`,
      cancel_url: `${origin}/sponsor`,
      metadata: { tier: body.tier },
      subscription_data: { metadata: { tier: body.tier } },
    });
    if (!session.url) throw new Error('Stripe returned no checkout URL');
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Sponsor checkout failed:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Could not start checkout. Please try again.' }, { status: 502 });
  }
}
