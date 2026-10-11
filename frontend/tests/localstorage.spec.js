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
