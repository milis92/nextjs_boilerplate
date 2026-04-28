import openapiTS, { astToString, COMMENT_HEADER } from "openapi-typescript"
import { writeFileSync, mkdirSync } from "fs"

const specUrl = process.env.OPENAPI_SPEC_URL ?? "http://localhost:3001/openapi.json"
const outDir = "src/lib/rest/generated"
const outFile = `${outDir}/api.ts`

mkdirSync(outDir, { recursive: true })

const ast = await openapiTS(new URL(specUrl))
writeFileSync(outFile, `${COMMENT_HEADER}${astToString(ast)}`)

console.log(`✓ REST types generated: ${specUrl} → ${outFile}`)
