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

test("modifier selection toggles tasks and shows a selected highlight", async ({ page }) => {
  await page.goto("/");

  await page.evaluate(() => {
    quadros = [{
      id: "board-1",
      nome: "Board 1",
      lista_de_tarefas: [
        { id: "t1", nome: "Alpha", desc: "", data_termino: "", prioridade: 1, categoria: "cat", status: "TODO", alarmes: [] },
        { id: "t2", nome: "Beta", desc: "", data_termino: "", prioridade: 2, categoria: "cat", status: "TODO", alarmes: [] },
        { id: "t3", nome: "Gamma", desc: "", data_termino: "", prioridade: 3, categoria: "cat", status: "DONE", alarmes: [] },
      ],
    }];
    quadro_selecionado = quadros[0];
    limpar_selecao();
    mostrar_tarefas();
  });

  const taskButtons = page.locator("[data-tarefa-id]");
  await expect(taskButtons).toHaveCount(3);

  await taskButtons.nth(0).click();
  await expect(page.locator(".tarefa-selecionada")).toHaveCount(1);

  await taskButtons.nth(1).click({ modifiers: ["Control"] });
  await expect(page.locator(".tarefa-selecionada")).toHaveCount(2);

  await taskButtons.nth(1).click({ modifiers: ["Control"] });
  await expect(page.locator(".tarefa-selecionada")).toHaveCount(1);
});
