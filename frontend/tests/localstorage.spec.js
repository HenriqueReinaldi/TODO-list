const { test, expect } = require("@playwright/test");

test("storage payload handles valid writes and invalid data safely", async ({ page }) => {
  const erros_da_pagina = [];
  page.on("pageerror", (error) => erros_da_pagina.push(error.message));

  await page.goto("/");

  const resultado = await page.evaluate(() => {
    const storage = window.todo_storage;
    if (!storage) {
      return { has_storage: false, reason: "missing" };
    }

    const estado_vazio = storage.read_state();
    storage.write_state({ version: 1, boards: [] });
    const round_trip = storage.read_state();

    storage.write_state({ version: 2, boards: [] });
    const mismatched = storage.read_state();

    window.localStorage.setItem(storage.storage_key, "{ not valid json");
    const mal_formado = storage.read_state();

    window.localStorage.setItem(storage.storage_key, JSON.stringify({ version: 1 }));
    const forma_invalida = storage.read_state();

    return {
      has_storage: true,
      estado_vazio: estado_vazio.value,
      round_trip: round_trip.value,
      mismatched: mismatched.value,
      mal_formado: mal_formado.value,
      forma_invalida: forma_invalida.value,
    };
  });

  expect(resultado.has_storage).toBe(true);
  expect(resultado.estado_vazio).toEqual({ version: 1, boards: [] });
  expect(resultado.round_trip).toEqual({ version: 1, boards: [] });
  expect(resultado.mismatched).toEqual({ version: 1, boards: [] });
  expect(resultado.mal_formado).toEqual({ version: 1, boards: [] });
  expect(resultado.forma_invalida).toEqual({ version: 1, boards: [] });
  expect(erros_da_pagina).toEqual([]);
});

test("board CRUD persists valid actions and rejects invalid names", async ({ page }) => {
  await page.goto("/");

  const entrada_quadro = page.locator("#input-nome");
  await entrada_quadro.fill("Trabalho");
  await entrada_quadro.press("Enter");

  await expect(page.locator("#area-quadros button")).toHaveCount(1);
  await expect(page.locator("#area-quadros button")).toHaveText("Trabalho");

  const payload_apos_criacao = await page.evaluate(() => JSON.parse(window.localStorage.getItem("todoAppState")));
  expect(payload_apos_criacao.boards[0].nome).toBe("Trabalho");

  await page.locator("#area-quadros button").click();
  await page.locator("#input-renomear-quadro").fill("Financeiro");
  await page.locator("#btn-renomear-quadro").click();

  await expect(page.locator("#area-quadros button")).toHaveText("Financeiro");

  const payload_apos_renomeacao = await page.evaluate(() => JSON.parse(window.localStorage.getItem("todoAppState")));
  expect(payload_apos_renomeacao.boards[0].nome).toBe("Financeiro");

  await entrada_quadro.fill("Financeiro");
  await entrada_quadro.press("Enter");

  await expect(page.locator("#area-quadros button")).toHaveCount(1);

  await page.locator("#btn-deletar-quadro").click();
  await expect(page.locator("#area-quadros button")).toHaveCount(0);

  const payload_apos_remocao = await page.evaluate(() => JSON.parse(window.localStorage.getItem("todoAppState")));
  expect(payload_apos_remocao.boards).toEqual([]);

  await page.reload();
  await expect(page.locator("#area-quadros button")).toHaveCount(0);
});

test("startup restores saved boards without auto-selection", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "todoAppState",
      JSON.stringify({
        version: 1,
        boards: [
          {
            id: "board-1",
            nome: "Trabalho",
            lista_de_tarefas: [
              {
                id: "task-1",
                nome: "Revisar código",
                desc: "Checar testes",
                status: "TODO",
                categoria: "dev",
                prioridade: 2,
                data_termino: "",
                alarmes: [],
              },
            ],
          },
        ],
      })
    );
  });

  await page.goto("/");

  await expect(page.locator("#area-quadros button")).toHaveCount(1);
  await expect(page.locator("#area-quadros button")).toHaveText("Trabalho");

  const estado_inicial = await page.evaluate(() => ({
    quadro_selecionado: !!window.quadro_selecionado,
    tarefa_selecionada: !!window.tarefa_selecionada,
    modo_listagem: window.modo_listagem,
  }));

  expect(estado_inicial).toEqual({
    quadro_selecionado: false,
    tarefa_selecionada: false,
    modo_listagem: "L_STATUS",
  });
});
