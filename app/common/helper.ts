import { createStorefrontClient } from "@shopify/hydrogen";

export function setAuthData(data: Map<string,string>) {
    data.forEach((key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    })
}

export function getAuthData(data: string[]):Map<string,string> {
    let items: Map<string,string> = new Map()
    data.forEach((key) => {
        items.set(key, JSON.stringify(localStorage.getItem(key)))
    })

    return items
}

export const store = createStorefrontClient({
  publicStorefrontToken: "ba3240f06c19dc2843d9f9b9d4229e4f",
  storeDomain: `https://cbd-chat.myshopify.com`,
  storefrontApiVersion: "2023-04",
});