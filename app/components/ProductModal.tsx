import { type ReactNode, useRef, Suspense, useMemo, useState, useEffect } from 'react';
import { Disclosure, Listbox } from '@headlessui/react';
import { defer, type LoaderArgs } from '@shopify/remix-oxygen';
import {
  useLoaderData,
  Await,
  useSearchParams,
  useLocation,
  useNavigation,
} from '@remix-run/react';

import {
  AnalyticsPageType,
  Money,
  ShopifyAnalyticsProduct,
  ShopPayButton,
} from '@shopify/hydrogen';
import {
  Heading,
  IconCaret,
  IconCheck,
  IconClose,
  ProductGallery,
  ProductSwimlane,
  Section,
  Skeleton,
  Text,
  Link,
  AddToCartButton,
  Button,
} from '~/components';
import { getExcerpt } from '~/lib/utils';
import { seoPayload } from '~/lib/seo.server';
import invariant from 'tiny-invariant';
import clsx from 'clsx';
import type {
  ProductVariant,
  SelectedOptionInput,
  Product as ProductType,
  Shop,
  ProductConnection,
} from '@shopify/hydrogen/storefront-api-types';
import { MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT } from '~/data/fragments';
import type { Storefront } from '~/lib/type';
import type { Product } from 'schema-dts';
import { routeHeaders, CACHE_SHORT } from '~/data/cache';
import { getProdcutApi } from '~/common/apis/products';
import { ProductDto } from '~/data/models/product_dto';
import { store } from '~/common/helper';

export const headers = routeHeaders;

export async function loader({ productId }: { productId: string }) {

  // if (!product?.id) {
  //   throw new Response('product', { status: 404 });
  // }

  // const firstVariant = product.variants.nodes[0];
  // const selectedVariant = product.selectedVariant ?? firstVariant;

  // const productAnalytics: ShopifyAnalyticsProduct = {
  //   productGid: product.id,
  //   variantGid: selectedVariant.id,
  //   name: product.title,
  //   variantName: selectedVariant.title,
  //   brand: product.vendor,
  //   price: selectedVariant.price.amount,
  // };

  // return defer(
  //   {
  //     product,
  //     shop,
  //     storeDomain: shop.primaryDomain.url,
  //     analytics: {
  //       pageType: AnalyticsPageType.product,
  //       resourceId: product.id,
  //       products: [productAnalytics],
  //       totalValue: parseFloat(selectedVariant.price.amount),
  //     },
  //   },
  //   {
  //     headers: {
  //       'Cache-Control': CACHE_SHORT,
  //     },
  //   },
  // );
}

export default function ProductModal({ productId, onClose }: { productId: string, onClose: () => void }) {
  // const { product } = loader({ productId: productId });

  async function getData() {
    console.log(productId);
    return await store.storefront.query<{
      product: ProductType;
      shop: Shop;
    }>(PRODUCT_QUERY, {
      variables: {
        id: productId
      },
    })
  }

  // useEffect(() => {
  //   getData()
  // }, [])
  // return <></>

  return (
    <>
      <Suspense fallback={<Skeleton />}>
        <Await resolve={getData()}>
          {(data) => {
            let product = data.product;
            return <Section className="px-0 md:px-8 lg:px-12">
              <div className="grid items-start md:gap-6 lg:gap-20 md:grid-cols-2 lg:grid-cols-3">
                <ProductGallery
                  media={product.media.nodes}
                  className="w-full lg:col-span-2"
                />
                <div className="sticky md:-mb-nav md:top-nav md:-translate-y-nav md:h-screen md:pt-nav hiddenScroll md:overflow-y-scroll">
                  <section className="flex flex-col w-full max-w-xl gap-8 p-6 md:mx-auto md:max-w-sm md:px-0">
                    <div className="grid gap-2">
                      <Heading as="h1" className="whitespace-normal">
                        {product.title}
                      </Heading>
                      {product.vendor && (
                        <Text className={'opacity-50 font-medium'}>{product.vendor}</Text>
                      )}
                    </div>
                    <div className="grid gap-4 py-4">
                      {product.descriptionHtml && (
                        <ProductDetail
                          title="Product Details"
                          content={product.descriptionHtml}
                        />
                      )}
                      {data.shop.shippingPolicy?.body && (
                        <ProductDetail
                          title="Shipping"
                          content={getExcerpt(data.shop.shippingPolicy?.body)}
                          learnMore={`/policies/${data.shop.shippingPolicy?.handle}`}
                        />
                      )}
                      {data.shop.refundPolicy?.body && (
                        <ProductDetail
                          title="Returns"
                          content={getExcerpt(data.shop.refundPolicy.body)}
                          learnMore={`/policies/${data.shop.refundPolicy.handle}`}
                        />
                      )}
                    </div>
                    <div onClick={() => { onClose() }}>
                      <ProductForm product={product} shop={data.shop} />
                    </div>
                  </section>
                </div>
              </div>
            </Section>
          }}
        </Await>
      </Suspense>
    </>
  );
}

export function ProductForm({ product, shop }: { product: ProductType, shop: Shop }) {

  const [currentSearchParams] = useSearchParams();
  const { location } = useNavigation();

  /**
   * We update `searchParams` with in-flight request data from `location` (if available)
   * to create an optimistic UI, e.g. check the product option before the
   * request has completed.
   */
  // const searchParams = useMemo(() => {
  //   return location
  //     ? new URLSearchParams(location.search)
  //     : currentSearchParams;
  // }, [currentSearchParams, location]);

  const firstVariant = product.variants.nodes[0];

  /**
   * We're making an explicit choice here to display the product options
   * UI with a default variant, rather than wait for the user to select
   * options first. Developers are welcome to opt-out of this behavior.
   * By default, the first variant's options are used.
   */
  // const searchParamsWithDefaults = useMemo<URLSearchParams>(() => {
  //   const clonedParams = new URLSearchParams(searchParams);

  //   for (const { name, value } of firstVariant.selectedOptions) {
  //     if (!searchParams.has(name)) {
  //       clonedParams.set(name, value);
  //     }
  //   }

  //   return clonedParams;
  // }, [searchParams, firstVariant.selectedOptions]);

  /**
   * Likewise, we're defaulting to the first variant for purposes
   * of add to cart if there is none returned from the loader.
   * A developer can opt out of this, too.
   */
  const selectedVariant = firstVariant;
  const isOutOfStock = !selectedVariant?.availableForSale;

  const isOnSale =
    selectedVariant?.price?.amount &&
    selectedVariant?.compareAtPrice?.amount &&
    selectedVariant?.price?.amount < selectedVariant?.compareAtPrice?.amount;

  const productAnalytics: ShopifyAnalyticsProduct = {
    productGid: product.id,
    variantGid: selectedVariant.id,
    name: product.title,
    variantName: selectedVariant.title,
    brand: product.vendor,
    price: selectedVariant.price.amount,
  }

  return (
    <div className="grid gap-10">
      <div className="grid gap-4">
        {selectedVariant && (
          <div className="grid items-stretch gap-4">
            {isOutOfStock ? (
              <Button variant="secondary" disabled>
                <Text>Sold out</Text>
              </Button>
            ) : (
              <AddToCartButton
                lines={[
                  {
                    merchandiseId: selectedVariant.id,
                    quantity: 1,
                  },
                ]}
                variant="primary"
                data-test="add-to-cart"
                analytics={{
                  products: [productAnalytics],
                  totalValue: parseFloat(productAnalytics.price),
                }}
              >
                <Text
                  as="span"
                  className="flex items-center justify-center gap-2"
                >
                  <span>Add to Cart</span> <span>·</span>{' '}
                  <Money
                    withoutTrailingZeros
                    data={selectedVariant?.price!}
                    as="span"
                  />
                  {isOnSale && (
                    <Money
                      withoutTrailingZeros
                      data={selectedVariant?.compareAtPrice!}
                      as="span"
                      className="opacity-50 strike"
                    />
                  )}
                </Text>
              </AddToCartButton>
            )}
            {/* {!isOutOfStock && (
              <ShopPayButton
                width="100%"
                variantIds={[selectedVariant?.id!]}
                storeDomain={shop.primaryDomain.host}
              />
            )} */}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductDetail({
  title,
  content,
  learnMore,
}: {
  title: string;
  content: string;
  learnMore?: string;
}) {
  return (
    <Disclosure key={title} as="div" className="grid w-full gap-2">
      {({ open }) => (
        <>
          <Disclosure.Button className="text-left">
            <div className="flex justify-between">
              <Text size="lead" as="h4">
                {title}
              </Text>
              <IconClose
                className={clsx(
                  'transition-transform transform-gpu duration-200',
                  !open && 'rotate-[45deg]',
                )}
              />
            </div>
          </Disclosure.Button>

          <Disclosure.Panel className={'pb-4 pt-2 grid gap-2'}>
            <div
              className="prose dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            {learnMore && (
              <div className="">
                <Link
                  className="pb-px border-b border-primary/30 text-primary/50"
                  to={learnMore}
                >
                  Learn more
                </Link>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariantFragment on ProductVariant {
    id
    availableForSale
    image {
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
  }
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $id: ID!
  ) {
    product(id: $id) {
      id
      title
      vendor
      handle
      descriptionHtml
      description
      options {
        name
        values
      }
      media(first: 7) {
        nodes {
          ...Media
        }
      }
      variants(first: 1) {
        nodes {
          ...ProductVariantFragment
        }
      }
      seo {
        description
        title
      }
    }
    shop {
      name
      primaryDomain {
        url
      }
      shippingPolicy {
        body
        handle
      }
      refundPolicy {
        body
        handle
      }
    }
  }
  ${MEDIA_FRAGMENT}
  ${PRODUCT_VARIANT_FRAGMENT}
`;
