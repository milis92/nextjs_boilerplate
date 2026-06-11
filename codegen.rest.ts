import openapiTS, { astToString, COMMENT_HEADER } from "openapi-typescript"
import { writeFileSync, mkdirSync } from "fs"
import { config } from "@dotenvx/dotenvx"

// tsx does not load Next's env files — load them the way `next dev` would.
config({
  path: [".env.local", ".env"],
  ignore: ["MISSING_ENV_FILE"],
  quiet: true,
})

const specUrl = process.env.OPENAPI_URL
if (!specUrl) {
  console.error(
    "OPENAPI_URL is not set. Copy .env.example to .env.local first."
  )
  process.exit(1)
}

const outDir = "src/lib/rest/generated"
const outFile = `${outDir}/api.ts`

mkdirSync(outDir, { recursive: true })

let ast
try {
  ast = await openapiTS(new URL(specUrl))
} catch (error) {
  console.error(
    `Failed to fetch the OpenAPI spec from ${specUrl} — is the NestJS backend running? (pnpm start:dev in nestjs-boilerplate)`
  )
  throw error
}
writeFileSync(outFile, `${COMMENT_HEADER}${astToString(ast)}`)

console.log(`✓ REST types generated: ${specUrl} → ${outFile}`)
