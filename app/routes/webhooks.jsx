import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";

export const action = async ({ request }) => {
    const { topic, shop, session, admin, payload } = await authenticate.webhook(request);

    console.log(`Received ${topic} webhook for ${shop}`);

    // Webhook requests can trigger multiple times and after an app has already been uninstalled.
    // If this webhook already runs:
    // - validate the request
    // - process the webhook
    // - respond with a 200 status code (this is handled by the authenticate.webhook helper)

    // For GDPR webhooks, we just need to acknowledge receipt since we don't store customer PII outside of Shopify.
    // If we did, we would need to handle the data request/redaction here.

    return json({ message: "Webhook processed" }, { status: 200 });
};
