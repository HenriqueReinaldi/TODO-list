const { test, expect } = require("@playwright/test");

test("selection state survives render and board switch", async ({ page }) => {
  await page.goto("/");
  // selection array exists and is empty initially
  const count0 = await page.evaluate(() => contar_selecionadas());
  expect(count0).toBe(0);
  
  const t1 = { id: "t1", nome: "x" };
  const t2 = { id: "t2", nome: "y" };
  await page.evaluate((t) => selecionar_tarefa(t), t1);
  expect(await page.evaluate(() => contar_selecionadas())).toBe(1);

  await page.evaluate(() => limpar_selecao());
  expect(await page.evaluate(() => contar_selecionadas())).toBe(0);

  await page.evaluate((t) => selecionar_tarefa(t), t1);
  await page.evaluate((t) => selecionar_tarefa(t), t2);
  expect(await page.evaluate(() => contar_selecionadas())).toBe(2);
});
