import type { Context, Next } from 'hono';
import { BatchFacilitatorClient } from '@circle-fin/x402-batching/server';


export function gatewayPayment(price: string) {
  return async (c: Context<{ Bindings: CloudflareBindings  }>, next: Next) => {
    const requirements = {
      scheme: 'exact',
      network: c.env.ARC_NETWORK_ID,
      asset: c.env.USDC_ADDRESS,
      amount: price,
      payTo: c.env.SELLER_ADDRESS,
      maxTimeoutSeconds: 3600,
      extra: {
        name: 'GatewayWalletBatched',
        version: '1',
        verifyingContract: c.env.GATEWAY_WALLET_ADDRESS,
      },
    };

    const paymentHeader = c.req.header('PAYMENT-SIGNATURE');

    if (!paymentHeader) {
      const paymentRequired = {
        x402Version: 1,
        resource: {
          url: c.req.path,
          description: `Tokenomist Executor API — ${c.req.path}`,
          mimeType: 'application/json',
        },
        accepts: [requirements],
      };
      const encoded = Buffer.from(JSON.stringify(paymentRequired)).toString('base64')
      c.header('PAYMENT-REQUIRED', encoded);
      return c.json(paymentRequired, 402 as any);
    }

    let paymentPayload;
    try {
      paymentPayload = JSON.parse(atob(paymentHeader));
    } catch {
      return c.json({ error: 'InvalidPaymentHeader', message: 'Could not decode PAYMENT-SIGNATURE header' }, 400 as any);
    }

    const facilitator = new BatchFacilitatorClient({ url: c.env.GATEWAY_FACILITATOR_URL });

    try {
      const settlement = await facilitator.settle(paymentPayload, requirements);

      if (!settlement.success) {
        return c.json(
          { error: settlement.errorReason ?? 'PaymentFailed', message: 'Payment settlement failed' },
          402 as any
        );
      }

      const responseHeader = btoa(JSON.stringify(settlement));
      c.header('PAYMENT-RESPONSE', responseHeader);

      await next();
    } catch (err: any) {
      return c.json(
        { error: 'PaymentVerificationError', message: err?.message ?? 'Could not verify payment' },
        400 as any
      );
    }
  };
}