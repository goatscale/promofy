import { useEffect, useState } from "react";
import { json } from "@remix-run/node";
import { useActionData, useSubmit, useNavigation } from "@remix-run/react";
import {
    Page,
    Layout,
    Card,
    TextField,
    BlockStack,
    PageActions,
    Banner,
    Checkbox,
    Text,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
    console.log("Discount creation action started");
    const { admin } = await authenticate.admin(request);
    const formData = await request.formData();
    const title = formData.get("title");
    const enableBuy8 = formData.get("enableBuy8") === "true";
    const enableBuy12 = formData.get("enableBuy12") === "true";

    // 1. Fetch the Function ID dynamically
    const functionsResponse = await admin.graphql(
        `#graphql
        query GetFunctions {
            shopifyFunctions(first: 25) {
                nodes {
                    id
                    title
                    apiType
                }
            }
        }`
    );

    const functionsJson = await functionsResponse.json();
    const functions = functionsJson.data.shopifyFunctions.nodes;
    console.log("Available Functions:", JSON.stringify(functions, null, 2));

    // Find the function with the title "buy-4-pay-2" (or whatever your extension is named)
    const functionNode = functions.find(f => f.title === "buy-4-pay-2");

    if (!functionNode) {
        return json({ errors: [{ message: "Function 'buy-4-pay-2' not found. Please ensure the extension is deployed." }] });
    }

    const functionId = functionNode.id;
    console.log("Found Function ID:", functionId);

    const baseDiscount = {
        functionId,
        title,
        startsAt: new Date(),
    };

    try {
        const response = await admin.graphql(
            `#graphql
      mutation discountAutomaticAppCreate($automaticAppDiscount: DiscountAutomaticAppInput!) {
        discountAutomaticAppCreate(automaticAppDiscount: $automaticAppDiscount) {
          automaticAppDiscount {
            discountId
          }
          userErrors {
            code
            message
            field
          }
        }
      }`,
            {
                variables: {
                    automaticAppDiscount: {
                        ...baseDiscount,
                        metafields: [
                            {
                                namespace: "$app:buy-4-pay-2",
                                key: "function-configuration",
                                value: JSON.stringify({
                                    enableBuy8,
                                    enableBuy12,
                                }),
                                type: "json",
                            },
                        ],
                    },
                },
            }
        );

        const responseJson = await response.json();
        console.log("GraphQL response:", JSON.stringify(responseJson, null, 2));

        const errors = responseJson.data.discountAutomaticAppCreate.userErrors;

        if (errors.length > 0) {
            console.error("User errors:", errors);
            return json({ errors });
        }

        return json({ success: true, target: "shopify://admin/discounts" }); // Redirect to discounts list
    } catch (error) {
        console.error("Action error:", error);
        return json({ errors: [{ message: error.message }] });
    }
};

export default function DiscountNew() {
    const submit = useSubmit();
    const actionData = useActionData();
    const navigation = useNavigation();
    const isLoading = navigation.state === "submitting";
    const [enableBuy8, setEnableBuy8] = useState(false);
    const [enableBuy12, setEnableBuy12] = useState(false);

    const [title, setTitle] = useState("Buy 4 Pay 2");

    useEffect(() => {
        console.log("Action Data:", actionData);
        if (actionData?.success) {
            open(actionData.target, "_top");
        }
    }, [actionData]);

    const submitForm = () => {
        submit({
            title,
            enableBuy8: enableBuy8.toString(),
            enableBuy12: enableBuy12.toString(),
        }, { method: "post" });
    };

    const errorBanner = actionData?.errors ? (
        <Layout.Section>
            <Banner tone="critical">
                <p>There were errors creating the discount:</p>
                <ul>
                    {actionData.errors.map((error, index) => (
                        <li key={index}>{error.message}</li>
                    ))}
                </ul>
            </Banner>
        </Layout.Section>
    ) : null;

    return (
        <Page title="Create Buy 4 Pay 2 Discount">
            <Layout>
                {errorBanner}
                <Layout.Section>
                    <Card>
                        <BlockStack gap="400">
                            <TextField
                                label="Discount Title"
                                value={title}
                                onChange={setTitle}
                                autoComplete="off"
                            />
                            <Text as="p">
                                This discount will automatically apply to carts with 4 or more items, making the 2 cheapest items free.
                            </Text>
                            <Text variant="headingSm" as="h3">Optional Tiers</Text>
                            <Checkbox
                                label="Enable Buy 8 Pay 4 (4 cheapest free)"
                                checked={enableBuy8}
                                onChange={(newChecked) => setEnableBuy8(newChecked)}
                            />
                            <Checkbox
                                label="Enable Buy 12 Pay 6 (6 cheapest free)"
                                checked={enableBuy12}
                                onChange={(newChecked) => setEnableBuy12(newChecked)}
                            />
                        </BlockStack>
                    </Card>
                </Layout.Section>
                <Layout.Section>
                    <PageActions
                        primaryAction={{
                            content: "Save discount",
                            onAction: submitForm,
                            loading: isLoading,
                        }}
                    />
                </Layout.Section>
            </Layout>
        </Page>
    );
}
