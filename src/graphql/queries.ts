import { gql } from "@apollo/client";

export const GET_PRODUCT = gql`
  query Product(
    $productId: String!
    $filter: String
    $userType: String
    $siteId: String
    $currencyCode: String
    $measureSystem: String
    $locale: String
    $postalCode: String
    $countryCode: String
  ) {
    product(
      productId: $productId
      filter: $filter
      userType: $userType
      siteId: $siteId
      currencyCode: $currencyCode
      measureSystem: $measureSystem
      locale: $locale
      postalCode: $postalCode
      countryCode: $countryCode
    ) {
      displayName
      imageUrl
    }
  }
`;

export const GET_PRODUCT_IMAGE = gql`
  query ProductImage(
    $productId: String!
    $imageKey: String
    $fullSkuId: String
    $swatchIds: [String!]
    $selectedOptionIds: [String!]
    $siteId: String
    $locale: String
    $newPDPLayout: Boolean
    $screen: String
  ) {
    productImage(
      productId: $productId
      imageKey: $imageKey
      fullSkuId: $fullSkuId
      swatchIds: $swatchIds
      selectedOptionIds: $selectedOptionIds
      siteId: $siteId
      locale: $locale
      newPDPLayout: $newPDPLayout
      screen: $screen
    ) {
      productId
      imageUrl
      __typename
    }
  }
`;
