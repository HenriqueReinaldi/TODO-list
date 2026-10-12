const { test, expect } = require("@playwright/test");

test("loads the task board interface", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("LISTA TODO");
  await expect(page.getByText("Selecione um quadro:")).toBeVisible();
  await expect(page.locator("#input-nome")).toBeVisible();
  await expect(page.locator("#area-tarefas")).toBeVisible();
});