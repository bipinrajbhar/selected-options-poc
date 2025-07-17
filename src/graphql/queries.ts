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
