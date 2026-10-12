(function () {
  const storage_key = "todoAppState";
  const storage_version = 1;

  function clonar_estado_padrao() {
    return { version: storage_version, boards: [] };
  }

  function local_storage_segura() {
    if (typeof window === "undefined") {
      throw new Error("window is unavailable");
    }

    if (!window.localStorage) {
      throw new Error("localStorage is unavailable");
    }

    return window.localStorage;
  }

  function validar_estado(candidato) {
    if (!candidato || typeof candidato !== "object" || Array.isArray(candidato)) {
      return { valid: false, reason: "invalid-structure" };
    }

    if (!Object.prototype.hasOwnProperty.call(candidato, "version")) {
      return { valid: false, reason: "invalid-structure" };
    }

    if (candidato.version !== storage_version) {
      return { valid: false, reason: "version-mismatch" };
    }

    if (!Array.isArray(candidato.boards)) {
      return { valid: false, reason: "invalid-structure" };
    }

    return {
      valid: true,
      value: {
        version: storage_version,
        boards: candidato.boards,
      },
    };
  }

  const todo_storage = {
    storage_key,
    storage_version,
    empty_state: clonar_estado_padrao(),

    read_state() {
      try {
        const storage = local_storage_segura();
        const valor_bruto = storage.getItem(storage_key);

        if (valor_bruto === null) {
          return { value: clonar_estado_padrao(), reason: "missing" };
        }

        let parseado;
        try {
          parseado = JSON.parse(valor_bruto);
        } catch (error) {
          return { value: clonar_estado_padrao(), reason: "malformed-json", error };
        }

        const validacao = validar_estado(parseado);
        if (!validacao.valid) {
          if (parseado && typeof parseado === "object" && "version" in parseado && parseado.version !== storage_version) {
            return { value: clonar_estado_padrao(), reason: "version-mismatch" };
          }

          return { value: clonar_estado_padrao(), reason: validacao.reason };
        }

        return { value: validacao.value, reason: "ok" };
      } catch (error) {
        return { value: clonar_estado_padrao(), reason: "unavailable", error };
      }
    },

    write_state(state) {
      const estado_padrao = clonar_estado_padrao();
      const proximo_estado = state && typeof state === "object" ? state : estado_padrao;
      const validacao = validar_estado(proximo_estado);
      const payload = validacao.valid ? validacao.value : estado_padrao;

      try {
        const storage = local_storage_segura();
        storage.setItem(storage_key, JSON.stringify(payload));
        return { ok: true, value: payload, reason: "saved" };
      } catch (error) {
        return { ok: false, value: payload, reason: "storage-error", error };
      }
    },
  };

  window.todo_storage = todo_storage;
})();
