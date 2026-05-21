import { AuthLoginPage } from "./_components/auth-login-page"

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string>>
}

export default async function Page({ params, searchParams }: Props) {
  return (
    <AuthLoginPage params={await params} searchParams={await searchParams} />
  )
}
