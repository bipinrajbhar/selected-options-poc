import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

const httpLink = createHttpLink({
  uri: "https://intc.rhnonprod.com/rh-experience-layer-v1-intc/graphql", // GraphQL endpoint
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
