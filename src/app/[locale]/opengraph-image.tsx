import { ImageResponse } from "next/og"
import { Env } from "@/lib/env"

export const runtime = "edge"
export const alt = Env.NEXT_PUBLIC_APP_NAME
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {Env.NEXT_PUBLIC_APP_NAME}
      </div>
    ),
    {
      ...size,
    }
  )
}
