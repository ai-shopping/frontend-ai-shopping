import { Await, useLoaderData } from "@remix-run/react";
import { Collection, ProductConnection } from "@shopify/hydrogen-react/storefront-api-types";
import { LoaderArgs, json } from "@shopify/remix-oxygen";
import { Suspense, useEffect, useState } from "react";
import invariant from "tiny-invariant";
import { getProdcutApi } from "~/common/apis/products";
import { Skeleton, getPaginationVariables } from "~/components";
import ChatBox from "~/components/ChatBox";
import ProductModal from "~/components/ProductModal";
import { CACHE_SHORT, routeHeaders } from "~/data/cache";
import { PRODUCT_CARD_FRAGMENT } from "~/data/fragments";
import { seoPayload } from "~/lib/seo.server";

const PAGE_BY = 8;

export const headers = routeHeaders;

export async function loader({ request, context: { storefront } }: LoaderArgs) {
  const variables = getPaginationVariables(request, PAGE_BY);

  const data = await storefront.query<{
    products: ProductConnection;
  }>(ALL_PRODUCTS_QUERY, {
    variables: {
      ...variables,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  invariant(data, 'No data returned from Shopify API');

  const seoCollection = {
    id: 'all-products',
    title: 'All Products',
    handle: 'products',
    descriptionHtml: 'All the store products',
    description: 'All the store products',
    seo: {
      title: 'All Products',
      description: 'All the store products',
    },
    metafields: [],
    products: data.products,
    updatedAt: '',
  } satisfies Collection;

  const seo = seoPayload.collection({
    collection: seoCollection,
    url: request.url,
  });

  return json(
    {
      products: data.products,
      seo,
    },
    {
      headers: {
        'Cache-Control': CACHE_SHORT,
      },
    },
  );
}


export default function Homepage() {
  const { products } = useLoaderData<typeof loader>();
  const [selectedProduct, setSelectedProduct] = useState("");
  const [modalState, setModalState] = useState(false);

  return <>
    <Suspense fallback={<Skeleton className="h-32" />}>
      <Await resolve={products}>
        {(products) => {
          return <>
            {selectedProduct !== "" ? <Modal productId={selectedProduct} state={modalState} onClose={() => {setModalState(false)}}/> : <></>}


            {/* @TODO: enable this for test products when server not available */}
            {/* <ChatBox selectProduct={(id) => {
              setSelectedProduct(id);
              setModalState(true);

            }} key={"products"} baseProducts={products.nodes.map((p) => {
              return {
                id: p.id,
                title: p.title,
                handle: p.handle,
                descriptionHtml: p.descriptionHtml,
                description: p.description,
                alt: p.title,
                media: p.variants,
                nodes: p,
                variants: p.variants,
                metafields: p.metafields,
                updatedAt: p.updatedAt,
              }
            })} /> */}

            <ChatBox selectProduct={(id) => {
              setSelectedProduct(id);
              setModalState(true);

            }} key={"products"} baseProducts={[]} />
          </>
        }}
      </Await>
    </Suspense>
  </>
}

function Modal({ productId, state, onClose }: { productId: string, state: boolean, onClose:() => void }) {

  useEffect(() => {}, [state, productId])

  return <>
    <div className={`animate__animated product-modal ${state ? "animate__fadeIn" : "animate__fadeOut"}`} onClick={(e) => {
      onClose();
    }} style={{
      display: state ? "block" : "none"
    }}>
    </div>
    <div className="product-modal-container"  style={{
      display: state ? "block" : "none"
    }}>
      <ProductModal productId={productId} onClose={() => {
        onClose();
      }}/>
    </div>
  </>
}


const ALL_PRODUCTS_QUERY = `#graphql
  query AllProducts(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        ...ProductCard
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;