const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");

// Sample product data
const products = [
  {
    id: "prod34521304",
    displayName: "Sample Product",
    imageUrl:
      "https://media.restorationhardware.com/is/image/rhis/prod6490266_E46747666_F_Frank_RHR?$PDP-IS-992$",
  },
];

// GraphQL schema
const typeDefs = `#graphql
  type Product {
    id: String!
    displayName: String!
    imageUrl: String!
  }

  type Query {
    product(id: String!): Product
  }
`;

// Resolvers
const resolvers = {
  Query: {
    product: (parent, { id }) => {
      return products.find((product) => product.id === id) || null;
    },
  },
};

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Export for serverless function
exports.handler = async (event, context) => {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "GraphQL server running" }),
  };
};
