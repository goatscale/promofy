import { Page, Layout, Text, Card, Button, BlockStack, InlineStack } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Index() {
  return (
    <Page>
      <TitleBar title="Promofy Dashboard" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Welcome to Promofy! 🎉
                  </Text>
                  <Text variant="bodyMd" as="p">
                    Boost your sales with powerful "Buy X Pay Y" promotions.
                    Get started by creating your first discount campaign.
                  </Text>
                </BlockStack>

                <InlineStack align="start">
                  <Button
                    variant="primary"
                    url="/app/discount/buy-4-pay-2/create"
                  >
                    Create Buy X Pay Y Promotion
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Quick Tips
                </Text>
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd">
                    • <strong>Buy 4 Pay 2:</strong> Customers get the 2 cheapest items free when buying 4.
                  </Text>
                  <Text as="p" variant="bodyMd">
                    • <strong>Buy 8 Pay 4:</strong> Enable this tier for larger orders.
                  </Text>
                  <Text as="p" variant="bodyMd">
                    • <strong>Buy 12 Pay 6:</strong> Maximize volume with this high-tier offer.
                  </Text>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
