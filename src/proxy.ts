import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/I18nRouting"

export default createMiddleware(routing)

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
}
