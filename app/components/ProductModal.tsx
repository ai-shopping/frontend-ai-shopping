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

import { routeHeaders } from '~/data/cache';
import { store } from '~/common/helper';
import HomeContext from '~/domain/context/HomeContext';

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
    console.log("get product: ",productId);
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
                    <div>
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
  const firstVariant = product.variants.nodes[0];

  const searchParams = useMemo(() => {
    return location
      ? new URLSearchParams(location.search)
      : currentSearchParams;
  }, [currentSearchParams, location]);

  const searchParamsWithDefaults = useMemo<URLSearchParams>(() => {
    const clonedParams = new URLSearchParams(searchParams);

    for (const { name, value } of firstVariant.selectedOptions) {
      if (!searchParams.has(name)) {
        clonedParams.set(name, value);
      }
    }

    return clonedParams;
  }, [searchParams, firstVariant.selectedOptions]);


  const selectedVariant = firstVariant
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

  useEffect(() => {}, [location])

  return (
    <div className="grid gap-10">
      <div className="grid gap-4">
        <ProductOptions
          options={product.options}
          searchParamsWithDefaults={searchParamsWithDefaults}
        />
        {selectedVariant && (
          <div className="grid items-stretch gap-4">
            {isOutOfStock ? (
              <Button variant="secondary" disabled>
                <Text>Sold out</Text>
              </Button>
            ) : (
              <HomeContext.Consumer>
                {state => <div onClick={() => {state.onClose()}}>
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
                </div>}
              </HomeContext.Consumer>
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

function ProductOptions({
  options,
  searchParamsWithDefaults,
}: {
  options: ProductType['options'];
  searchParamsWithDefaults: URLSearchParams;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      {options
        .filter((option) => option.values.length > 1)
        .map((option) => (
          <div
            key={option.name}
            className="flex flex-col flex-wrap mb-4 gap-y-2 last:mb-0"
          >
            <Heading as="legend" size="lead" className="min-w-[4rem]">
              {option.name}
            </Heading>
            <div className="flex flex-wrap items-baseline gap-4">
              {/**
               * First, we render a bunch of <Link> elements for each option value.
               * When the user clicks one of these buttons, it will hit the loader
               * to get the new data.
               *
               * If there are more than 7 values, we render a dropdown.
               * Otherwise, we just render plain links.
               */}
              {option.values.length > 7 ? (
                <div className="relative w-full">
                  <Listbox>
                    {({ open }) => (
                      <>
                        <Listbox.Button
                          ref={closeRef}
                          className={clsx(
                            'flex items-center justify-between w-full py-3 px-4 border border-primary',
                            open
                              ? 'rounded-b md:rounded-t md:rounded-b-none'
                              : 'rounded',
                          )}
                        >
                          <span>
                            {searchParamsWithDefaults.get(option.name)}
                          </span>
                          <IconCaret direction={open ? 'up' : 'down'} />
                        </Listbox.Button>
                        <Listbox.Options
                          className={clsx(
                            'border-primary bg-contrast absolute bottom-12 z-30 grid h-48 w-full overflow-y-scroll rounded-t border px-2 py-2 transition-[max-height] duration-150 sm:bottom-auto md:rounded-b md:rounded-t-none md:border-t-0 md:border-b',
                            open ? 'max-h-48' : 'max-h-0',
                          )}
                        >
                          {option.values.map((value) => (
                            <Listbox.Option
                              key={`option-${option.name}-${value}`}
                              value={value}
                            >
                              {({ active }) => (
                                <ProductOptionLink
                                  optionName={option.name}
                                  optionValue={value}
                                  className={clsx(
                                    'text-primary w-full p-2 transition rounded flex justify-start items-center text-left cursor-pointer',
                                    active && 'bg-primary/10',
                                  )}
                                  searchParams={searchParamsWithDefaults}
                                  onClick={() => {
                                    if (!closeRef?.current) return;
                                    closeRef.current.click();
                                  }}
                                >
                                  {value}
                                  {searchParamsWithDefaults.get(option.name) ===
                                    value && (
                                      <span className="ml-2">
                                        <IconCheck />
                                      </span>
                                    )}
                                </ProductOptionLink>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </>
                    )}
                  </Listbox>
                </div>
              ) : (
                <>
                  {option.values.map((value) => {
                    const checked =
                      searchParamsWithDefaults.get(option.name) === value;
                    const id = `option-${option.name}-${value}`;

                    return (
                      <Text key={id}>
                        <ProductOptionLink
                          optionName={option.name}
                          optionValue={value}
                          searchParams={searchParamsWithDefaults}
                          className={clsx(
                            'leading-none py-1 border-b-[1.5px] cursor-pointer transition-all duration-200',
                            checked ? 'border-primary/50' : 'border-primary/0',
                          )}
                        />
                      </Text>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        ))}
    </>
  );
}

function ProductOptionLink({
  optionName,
  optionValue,
  searchParams,
  children,
  ...props
}: {
  optionName: string;
  optionValue: string;
  searchParams: URLSearchParams;
  children?: ReactNode;
  [key: string]: any;
}) {
  const { pathname } = useLocation();
  const isLocalePathname = /\/[a-zA-Z]{2}-[a-zA-Z]{2}\//g.test(pathname);
  // fixes internalized pathname
  const path = isLocalePathname
    ? `/${pathname.split('/').slice(2).join('/')}`
    : pathname;

  const clonedSearchParams = new URLSearchParams(searchParams);
  clonedSearchParams.set(optionName, optionValue);

  return (
    <Link
      {...props}
      preventScrollReset
      prefetch="intent"
      replace
      to={`${path}?${clonedSearchParams.toString()}`}
    >
      {children ?? optionValue}
    </Link>
  );
}


const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariantFragment on ProductVariant {
    id
    availableForSale
    selectedOptions {
      name
      value
    }
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
