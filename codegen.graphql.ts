import type {CodegenConfig} from "@graphql-codegen/cli"

const config: CodegenConfig = {
    overwrite: true,
    schema: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    documents: [
        "src/app/**/*.{ts,tsx}",
        "src/components/**/*.{ts,tsx}",
        "src/lib/**/*.{ts,tsx}",
    ],
    ignoreNoDocuments: true,
    generates: {
        "./src/lib/graphql/generated/": {
            preset: "client",
            config: {
                useTypeImports: true,
            },
        },
    },
}

export default config
