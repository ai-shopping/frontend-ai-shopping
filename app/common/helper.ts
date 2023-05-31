import { createStorefrontClient } from "@shopify/hydrogen";

export function setLocalStorageData(data: Map<string,string>) {
    data.forEach((value, key) => {
        console.log(JSON.stringify(value))
        localStorage.setItem(key, JSON.stringify(value));
    })
}

export function getLocalStorageData(data: string[]):Map<string,string> {
    let items: Map<string,string> = new Map()
    data.forEach((key) => {
        items.set(key, JSON.parse(localStorage.getItem(key) ?? ""))
    })

    return items
}

export const store = createStorefrontClient({
  publicStorefrontToken: "ba3240f06c19dc2843d9f9b9d4229e4f",
  storeDomain: `https://cbd-chat.myshopify.com`,
  storefrontApiVersion: "2023-04",
});

export const getStorefrontApiUrl = store.storefront.getApiUrl;
export const getPrivateTokenHeaders = store.storefront.getPublicTokenHeaders;