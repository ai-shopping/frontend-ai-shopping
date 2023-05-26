
import type {
  ProductVariant,
  SelectedOptionInput,
  CollectionConnection,
  Product as ProductType,
  // Shop,
  ProductConnection,
  Shop,
} from '@shopify/hydrogen/storefront-api-types';
import { AppLoadContext } from "@shopify/remix-oxygen";
import { MEDIA_FRAGMENT } from '~/data/fragments';
import { BOT_URL } from "../const";
import { POST } from '../requests';
import { AnswerDto } from '~/data/models/answer_dto';
import { store } from '../helper';


export async function question(message: string): Promise<AnswerDto | null> {
  let response = await POST(`${BOT_URL}/api/v1/questions`, {
    "store_name": "cbd_chat",
    "question": message
  }, true)

  if (response?.status === 200) {
    return await response.json()
  } else {
    throw response
  }
}

export async function getProdcutApi(id: string) {
  let product_id = `gid://shopify/Product/${id.split(":")[1].toString()}`
  var response: any = await store.storefront.query(`#graphql
  query getProductById($id: ID!) {
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
      },
      media(first: 7) {
        nodes {
          ...Media
        }
      },
      variants(first: 1) {
        nodes {
          id
          image {
            url
            altText
            width
            height
          }
          price {
            amount
            currencyCode
          }
        }
      }
    }
  }
  ${MEDIA_FRAGMENT}
  `, {
    variables: {
      id: product_id
    }
  });

  return response.product
}