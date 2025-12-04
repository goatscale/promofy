import { Page, Layout, Card, BlockStack, Text } from "@shopify/polaris";

export default function DiscountDetails() {
    return (
        <Page title="Buy 4 Pay 2 Discount">
            <Layout>
                <Layout.Section>
                    <Card>
                        <BlockStack gap="400">
                            <Text variant="headingMd" as="h2">
                                Discount Active
                            </Text>
                            <p>
                                This discount is managed by the Promofy app. It automatically applies to carts with 4 or more items, making the 2 cheapest items free.
                            </p>
                        </BlockStack>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
