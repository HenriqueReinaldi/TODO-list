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

  await taskButtons.nth(0).click();
  await expect(page.locator(".tarefa-selecionada")).toHaveCount(0);
  expect(await page.evaluate(() => contar_selecionadas())).toBe(0);
});

test("editor modes reflect zero, one, and multiple selections", async ({ page }) => {
  await page.goto("/");

  await page.evaluate(() => {
    quadros = [{
      id: "board-1",
      nome: "Board 1",
      lista_de_tarefas: [
        { id: "t1", nome: "Alpha", desc: "Primeiro", data_termino: "", prioridade: 1, categoria: "dev", status: "TODO", alarmes: [] },
        { id: "t2", nome: "Beta", desc: "Segundo", data_termino: "", prioridade: 3, categoria: "qa", status: "DOING", alarmes: [] },
      ],
    }];
    quadro_selecionado = quadros[0];
    limpar_selecao();
    mostrar_tarefas();
    atualizar_estado_formulario();
  });

  await expect(page.locator("#input-nome-tarefa")).toBeEnabled();
  await expect(page.locator("#input-descricao")).toBeEnabled();
  await expect(page.locator("#input-alarme")).toBeEnabled();
  await expect(page.locator("#mensagem-edicao")).toBeHidden();

  await page.locator("[data-tarefa-id='t1']").click();

  await expect(page.locator("#input-nome-tarefa")).toBeDisabled();
  await expect(page.locator("#input-descricao")).toBeEnabled();
  await expect(page.locator("#input-alarme")).toBeEnabled();
  await expect(page.locator("#input-categoria")).toHaveValue("dev");
  await expect(page.locator("#select-status")).toHaveValue("TODO");

  await page.locator("[data-tarefa-id='t2']").click({ modifiers: ["Control"] });

  await expect(page.locator("#input-nome-tarefa")).toBeDisabled();
  await expect(page.locator("#input-descricao")).toBeDisabled();
  await expect(page.locator("#input-alarme")).toBeDisabled();
  await expect(page.locator("#check-sim-alarme")).toBeDisabled();
  await expect(page.locator("#mensagem-edicao")).toBeVisible();
  await expect(page.locator("#mensagem-edicao")).toContainText(/várias tarefas|múltiplas/i);

  await page.evaluate(() => limpar_selecao());
  await expect(page.locator("#input-nome-tarefa")).toBeEnabled();
  await expect(page.locator("#mensagem-edicao")).toBeHidden();
});

test("bulk editing waits for save and protects single-task actions", async ({ page }) => {
  await page.goto("/");

  await page.evaluate(() => {
    quadros = [{
      id: "board-1",
      nome: "Board 1",
      lista_de_tarefas: [
        { id: "t1", nome: "Alpha", desc: "Primeiro", data_termino: "", prioridade: 1, categoria: "dev", status: "TODO", alarmes: [] },
        { id: "t2", nome: "Beta", desc: "Segundo", data_termino: "", prioridade: 3, categoria: "qa", status: "DOING", alarmes: [] },
      ],
    }];
    quadro_selecionado = quadros[0];
    limpar_selecao();
    mostrar_tarefas();
  });

  await page.locator("[data-tarefa-id='t1']").click();
  await page.locator("[data-tarefa-id='t2']").click({ modifiers: ["Control"] });

  await page.locator("#select-status").selectOption("DONE");
  await page.locator("#input-categoria").fill("ops");
  await page.locator("#input-prioridade").fill("5");

  const estado_antes = await page.evaluate(() => quadros[0].lista_de_tarefas.map((t) => ({
    id: t.id,
    status: t.status,
    categoria: t.categoria,
    prioridade: t.prioridade,
  })));
  expect(estado_antes).toEqual([
    { id: "t1", status: "TODO", categoria: "dev", prioridade: 1 },
    { id: "t2", status: "DOING", categoria: "qa", prioridade: 3 },
  ]);

  await page.locator("#btn-salvar-adicionar").click();

  const estado_depois = await page.evaluate(() => quadros[0].lista_de_tarefas.map((t) => ({
    id: t.id,
    status: t.status,
    categoria: t.categoria,
    prioridade: t.prioridade,
  })));
  expect(estado_depois).toEqual([
    { id: "t1", status: "DONE", categoria: "ops", prioridade: 5 },
    { id: "t2", status: "DONE", categoria: "ops", prioridade: 5 },
  ]);

  await page.locator("[data-tarefa-id='t1']").click();
  await page.locator("#btn-deletar").click();
  expect(await page.evaluate(() => contar_selecionadas())).toBe(0);
});
