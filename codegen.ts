import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "external/schema.graphql",
  documents: ["src/**/*.{ts,tsx,graphql}"],
  ignoreNoDocuments: true,
  generates: {
    "src/gql/": {
      preset: "client",
    },
  },
};

export default config;
