import openapiTS, { astToString } from "openapi-typescript"
import { writeFileSync, mkdirSync } from "fs"

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const specPath = process.env.OPENAPI_SPEC_PATH ?? "/openapi.json"
const specUrl = `${apiUrl}${specPath}`
const outDir = "lib/rest"
const outFile = `${outDir}/api.ts`

mkdirSync(outDir, { recursive: true })

const ast = await openapiTS(new URL(specUrl))
writeFileSync(outFile, astToString(ast))

console.log(`✓ REST types generated: ${specUrl} → ${outFile}`)
