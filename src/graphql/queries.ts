import { gql } from "@apollo/client";

export const GET_PRODUCT = gql`
  query GetProduct($productId: String!) {
    product(id: $productId) {
      id
      displayName
      imageUrl
    }
  }
`;
