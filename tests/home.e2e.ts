import { expect, test } from "@playwright/test"

test("home page renders localized heading in English", async ({ page }) => {
  await page.goto("/")
  await expect(
    page.getByRole("heading", { name: /project ready/i })
  ).toBeVisible()
  await expect(page.getByRole("button", { name: /button/i })).toBeVisible()
})

test("home page renders German heading at /de", async ({ page }) => {
  await page.goto("/de")
  await expect(
    page.getByRole("heading", { name: /projekt bereit/i })
  ).toBeVisible()
})
