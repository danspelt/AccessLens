import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getCollection } from '@/lib/db/mongoClient';
import { tierForPriceId } from '@/lib/sponsorship';

type SponsorRecord = {
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  tier: string;
  status: string;
  email: string | null;
  updatedAt: Date;
  createdAt: Date;
};

async function recordSponsor(input: {
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  priceId: string | null;
  status: string;
  email: string | null;
}) {
  const sponsors = await getCollection<SponsorRecord>('sponsors');
  const now = new Date();
  await sponsors.updateOne(
    { stripeCustomerId: input.stripeCustomerId },
    {
      $set: {
        stripeSubscriptionId: input.stripeSubscriptionId,
        tier: input.priceId ? (tierForPriceId(input.priceId) ?? 'unknown') : 'unknown',
        status: input.status,
        email: input.email,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  const body = await request.text();
  if (!signature || !body) {
    return NextResponse.json({ error: 'Missing signature.' }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, secret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId =
          typeof session.customer === 'string' ? session.customer : session.customer?.id;
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id ?? null;
        if (!customerId) break;
        const subscription = subscriptionId
          ? await stripe.subscriptions.retrieve(subscriptionId)
          : null;
        await recordSponsor({
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          priceId: subscription?.items.data[0]?.price.id ?? null,
          status: subscription?.status ?? 'active',
          email: session.customer_details?.email ?? session.customer_email ?? null,
        });
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id;
        await recordSponsor({
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          priceId: subscription.items.data[0]?.price.id ?? null,
          status: subscription.status,
          email: null,
        });
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
        const subscriptionRef = invoice.parent?.subscription_details?.subscription;
        const subscriptionId =
          typeof subscriptionRef === 'string' ? subscriptionRef : subscriptionRef?.id ?? null;
        if (!customerId) break;
        await recordSponsor({
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          priceId: null,
          status: 'past_due',
          email: invoice.customer_email ?? null,
        });
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error(`Stripe webhook ${event.type} failed:`, error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
