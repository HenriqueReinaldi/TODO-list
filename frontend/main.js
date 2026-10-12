const warning_storage = document.getElementById("warning-storage");
const input_nome_novo_quadro = document.getElementById("input-nome");
const area_quadros = document.getElementById("area-quadros");
const input_renomear_quadro = document.getElementById("input-renomear-quadro");
const btn_renomear_quadro = document.getElementById("btn-renomear-quadro");
const btn_deletar_quadro = document.getElementById("btn-deletar-quadro");

//tarefas
const area_tarefas = document.getElementById("area-tarefas");
const btn_salvar_adicionar = document.getElementById("btn-salvar-adicionar");
const btn_deletar = document.getElementById("btn-deletar");

const input_nome_tarefa = document.getElementById("input-nome-tarefa");
const select_status = document.getElementById("select-status");
const input_categoria = document.getElementById("input-categoria");
const input_prioridade = document.getElementById("input-prioridade");
const input_descricao = document.getElementById("input-descricao");
const input_alarme = document.getElementById("input-alarme");
const check_sim_alarme = document.getElementById("check-sim-alarme");
const mensagem_edicao = document.getElementById("mensagem-edicao");

//config
const config_select_display = document.getElementById("select-display");

//templates
const template_container = document.getElementById("template-container");

//status
var modo_listagem = "L_STATUS";
var tarefas_selecionadas = [];
var tarefa_selecionada = null;
var quadro_selecionado = null;
var quadros = [];

function gerar_id(prefixo) {
    return `${prefixo}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function normalizar_tarefa(tarefa) {
    if (!tarefa || typeof tarefa !== "object") {
        return null;
    }

    return {
        id: tarefa.id || gerar_id("tarefa"),
        nome: tarefa.nome || "",
        desc: tarefa.desc || "",
        data_termino: tarefa.data_termino || "",
        prioridade: Number.isFinite(Number(tarefa.prioridade)) ? Number(tarefa.prioridade) : 1,
        categoria: tarefa.categoria || "",
        status: tarefa.status || "TODO",
        alarmes: Array.isArray(tarefa.alarmes) ? tarefa.alarmes : [],
    };
}

function normalizar_quadro(quadro) {
    if (!quadro || typeof quadro !== "object") {
        return null;
    }

    const tarefas = Array.isArray(quadro.lista_de_tarefas)
        ? quadro.lista_de_tarefas.map(normalizar_tarefa).filter(Boolean)
        : [];

    return {
        id: quadro.id || gerar_id("quadro"),
        nome: quadro.nome || "",
        lista_de_tarefas: tarefas,
    };
}

function exibir_aviso_armazenamento(mensagem) {
    if (!warning_storage) return;
    warning_storage.textContent = mensagem;
    warning_storage.hidden = false;
}

function ocultar_aviso_armazenamento() {
    if (!warning_storage) return;
    warning_storage.textContent = "";
    warning_storage.hidden = true;
}

function mensagem_erro_armazenamento(reason) {
    switch (reason) {
        case "missing":
            return null;
        case "malformed-json":
            return "Os dados salvos no navegador estão corrompidos e o app foi reiniciado com um estado limpo.";
        case "version-mismatch":
            return "A versão dos dados salvos é incompatível com esta interface e o app foi reiniciado com um estado limpo.";
        case "invalid-structure":
            return "Os dados salvos estão em um formato inválido e o app foi reiniciado com um estado limpo.";
        case "unavailable":
            return "O armazenamento do navegador está indisponível ou bloqueado, então o app continuou sem persistência.";
        default:
            return "Não foi possível carregar a persistência salva e o app foi reiniciado com um estado limpo.";
    }
}

function salvar_estado() {
    if (!window.todo_storage || typeof window.todo_storage.write_state !== "function") {
        return;
    }

    const resultado = window.todo_storage.write_state({
        version: 1,
        boards: quadros.map(normalizar_quadro).filter(Boolean),
    });

    if (resultado && resultado.ok === false) {
        exibir_aviso_armazenamento("Não foi possível salvar o estado no navegador. O app continua em uso sem persistência.");
        return;
    }

    ocultar_aviso_armazenamento();
}

function restaurar_estado() {
    quadro_selecionado = null;
    tarefa_selecionada = null;
    modo_listagem = "L_STATUS";

    if (!window.todo_storage || typeof window.todo_storage.read_state !== "function") {
        quadros = [];
        return;
    }

    const estado = window.todo_storage.read_state();
    const dados = estado && estado.value ? estado.value : { version: 1, boards: [] };
    const razao = estado && estado.reason ? estado.reason : "missing";

    if (razao === "ok" || razao === "missing") {
        ocultar_aviso_armazenamento();
    } else {
        const mensagem = mensagem_erro_armazenamento(razao);
        if (mensagem) exibir_aviso_armazenamento(mensagem);
    }

    quadros = Array.isArray(dados.boards)
        ? dados.boards.map(normalizar_quadro).filter(Boolean)
        : [];
}

function normalizar_nome_quadro(nome) {
    return String(nome ?? "").trim();
}

function normalizar_nome_tarefa(nome) {
    return String(nome ?? "").trim();
}

function nome_quadro_duplicado(nome, id_para_ignorar = null) {
    const nome_normalizado = normalizar_nome_quadro(nome).toLowerCase();
    if (nome_normalizado === "") {
        return true;
    }

    return quadros.some((quadro) => {
        const mesmo_id = id_para_ignorar && quadro.id === id_para_ignorar;
        if (mesmo_id) return false;
        return normalizar_nome_quadro(quadro.nome).toLowerCase() === nome_normalizado;
    });
}

function nome_tarefa_duplicado(nome, id_para_ignorar = null) {
    const nome_normalizado = normalizar_nome_tarefa(nome).toLowerCase();
    if (nome_normalizado === "") {
        return true;
    }

    if (!quadro_selecionado) {
        return true;
    }

    return quadro_selecionado.lista_de_tarefas.some((tarefa) => {
        const mesmo_id = id_para_ignorar && tarefa.id === id_para_ignorar;
        if (mesmo_id) return false;
        return normalizar_nome_tarefa(tarefa.nome).toLowerCase() === nome_normalizado;
    });
}

function atualizar_controle_quadro() {
    if (quadro_selecionado) {
        input_renomear_quadro.value = quadro_selecionado.nome;
    } else {
        input_renomear_quadro.value = "";
    }
}

function renderizar_quadros() {
    const botoes_atuais = area_quadros.querySelectorAll("button[data-quadro-id]");
    for (const botao of botoes_atuais) {
        botao.remove();
    }

    for (const quadro of quadros) {
        const botao = document.createElement("button");
        botao.dataset.quadroId = quadro.id;
        botao.textContent = quadro.nome;
        botao.addEventListener("click", () => usar_quadro(quadro));
        area_quadros.appendChild(botao);
    }

    atualizar_controle_quadro();
}

//INICIALIZACAO

function init() {
    restaurar_estado();
    renderizar_quadros();
    mostrar_tarefas();
    atualizar_estado_formulario();
}
init();

function usar_quadro(quadro) {
    limpar_area_tarefas();
    quadro_selecionado = quadro;
    limpar_selecao();
    atualizar_controle_quadro();
    mostrar_tarefas();
    atualizar_estado_formulario();
}

function novo_quadro(){
    //reflete src/main/java/../classes/Quadro_de_tarefas.java
    return {
        id: gerar_id("quadro"),
        nome : "",
        lista_de_tarefas : [],
    }
}

function nova_tarefa(){
    //reflete src/main/java/../classes/Tarefa.java
    return {
        id: gerar_id("tarefa"),
        nome : "",
        desc : "",
        data_termino : "",
        prioridade : 1,
        categoria : "",
        status : "TODO",
        alarmes : [],
    }
}

//==============

//displayingdaszda

function criar_tarefa_btn(t){
    let tarefa_btn = document.createElement("button");
    tarefa_btn.type = "button";
    tarefa_btn.dataset.tarefaId = t.id;
    tarefa_btn.classList.toggle("tarefa-selecionada", tarefas_selecionadas.includes(t));
    tarefa_btn.addEventListener("click", (event) => {
        const com_modificador = event.ctrlKey || event.metaKey;

        if (com_modificador) {
            alternar_selecao_tarefa(t);
        } else if (tarefas_selecionadas.includes(t)) {
            alternar_selecao_tarefa(t);
        } else {
            limpar_selecao();
            selecionar_tarefa(t);
        }

        tarefa_selecionada = tarefas_selecionadas.length === 1 ? tarefas_selecionadas[0] : null;
        mostrar_tarefas();
        atualizar_estado_formulario();
    });
    tarefa_btn.innerHTML = t.nome;

    return tarefa_btn;
}

function limpar_area_tarefas(){
    let remocao = document.querySelectorAll(".temp-tarefa");
    for (let el of remocao) el.remove();
}

function mostrar_tarefas_status(){
    for (let tit of ["TODO", "DOING", "DONE"]) {
        const area = template_container.content.cloneNode(true);
        const tit_elemento = area.querySelector(".container-titulo");
        const container_tarefas = area.querySelector(".container-tarefas");
        tit_elemento.innerHTML = tit;

        for (let t of quadro_selecionado.lista_de_tarefas){
            if (t.status !== tit) continue;
            let btn = criar_tarefa_btn(t);
            container_tarefas.appendChild(btn);
        }

        area_tarefas.appendChild(area);
    }
}

function mostrar_tarefas_prioridade(){
    for (let tit of ["1", "2", "3", "4", "5"]) {
        const area = template_container.content.cloneNode(true);
        const tit_elemento = area.querySelector(".container-titulo");
        const container_tarefas = area.querySelector(".container-tarefas");
        tit_elemento.innerHTML = tit;

        for (let t of quadro_selecionado.lista_de_tarefas){
            if (String(t.prioridade) !== tit) continue;
            let btn = criar_tarefa_btn(t);
            container_tarefas.appendChild(btn);
        }

        area_tarefas.appendChild(area);
    }
}

function mostrar_tarefas_categoria(){
    let categorias = {};
    for (let t of quadro_selecionado.lista_de_tarefas){
        categorias[t.categoria] = 1;
    }

    for (let tit of Object.keys(categorias)) {
        const area = template_container.content.cloneNode(true);
        const tit_elemento = area.querySelector(".container-titulo");
        const container_tarefas = area.querySelector(".container-tarefas");
        tit_elemento.innerHTML = tit;

        for (let t of quadro_selecionado.lista_de_tarefas){
            if (String(t.categoria) !== tit) continue;
            let btn = criar_tarefa_btn(t);
            container_tarefas.appendChild(btn);
        }

        area_tarefas.appendChild(area);
    }
}

function mostrar_tarefas(){
    limpar_area_tarefas();
    if (quadro_selecionado == null) return;

    switch (modo_listagem){
        case "L_STATUS":
            mostrar_tarefas_status();
            break;
        case "L_PRIORIDADE":
            mostrar_tarefas_prioridade();
            break;
        case "L_CATEGORIA":
            mostrar_tarefas_categoria();
            break;
        case "L_FDS":
            break;
    }
}

//================

//interacao com documento
input_nome_novo_quadro.onkeydown = (e) => {
    if (e.key !== "Enter") return;
    const nome = normalizar_nome_quadro(input_nome_novo_quadro.value);
    if (nome === "" || nome_quadro_duplicado(nome)) return;

    const quadro = novo_quadro();
    quadro.nome = nome;
    quadros.push(quadro);
    salvar_estado();
    renderizar_quadros();
    input_nome_novo_quadro.value = "";
};

btn_renomear_quadro.addEventListener("click", () => {
    if (quadro_selecionado == null) return;

    const nome = normalizar_nome_quadro(input_renomear_quadro.value);
    if (nome === "" || nome_quadro_duplicado(nome, quadro_selecionado.id)) return;

    quadro_selecionado.nome = nome;
    salvar_estado();
    renderizar_quadros();
});

btn_deletar_quadro.addEventListener("click", () => {
    if (quadro_selecionado == null) return;

    quadros = quadros.filter((quadro) => quadro.id !== quadro_selecionado.id);
    quadro_selecionado = null;
    limpar_selecao();
    salvar_estado();
    renderizar_quadros();
    mostrar_tarefas();
});

btn_salvar_adicionar.addEventListener("click", _ => {
    if (quadro_selecionado == null) return;

    const quantidade = contar_selecionadas();
    const status = select_status.value;
    const categoria = input_categoria.value;
    const prioridade = parseInt(input_prioridade.value, 10);
    const descricao = input_descricao.value;
    const alarme = input_alarme.value;
    const nome = normalizar_nome_tarefa(input_nome_tarefa.value);
    const novo_alarme_check = check_sim_alarme.checked;

    if (quantidade > 1) {
        const valores_validos = Number.isInteger(prioridade) && prioridade >= 1 && prioridade <= 5;
        if (!valores_validos) return;

        for (const tarefa of tarefas_selecionadas) {
            tarefa.status = status;
            tarefa.categoria = categoria;
            tarefa.prioridade = prioridade;
        }

        input_nome_tarefa.value = "";
        check_sim_alarme.checked = false;
        input_alarme.value = "";
        salvar_estado();
        mostrar_tarefas();
        atualizar_estado_formulario();
        return;
    }

    if (nome !== "") {
        if (nome_tarefa_duplicado(nome)) return;

        let tarefa = nova_tarefa();
        tarefa.status = status;
        tarefa.categoria = categoria;
        tarefa.prioridade = prioridade;
        tarefa.desc = descricao;
        tarefa.nome = nome;
        if (novo_alarme_check && alarme !== "") tarefa.alarmes.push(alarme);
        quadro_selecionado.lista_de_tarefas.push(tarefa);
        input_nome_tarefa.value = "";
        check_sim_alarme.checked = false;
        input_alarme.value = "";
        salvar_estado();
        mostrar_tarefas();
        return;
    }

    if (tarefa_selecionada == null) return;

    tarefa_selecionada.status = status;
    tarefa_selecionada.categoria = categoria;
    tarefa_selecionada.prioridade = prioridade;
    tarefa_selecionada.desc = descricao;
    if (novo_alarme_check && alarme !== "" && !tarefa_selecionada.alarmes.includes(alarme)) {
        tarefa_selecionada.alarmes.push(alarme);
    }

    input_nome_tarefa.value = "";
    check_sim_alarme.checked = false;
    input_alarme.value = "";
    salvar_estado();
    mostrar_tarefas();
});

btn_deletar.addEventListener("click", _ => {
    if (quadro_selecionado == null) return;
    if (contar_selecionadas() !== 1) return;

    let pos = quadro_selecionado.lista_de_tarefas.indexOf(tarefa_selecionada);
    if (pos >= 0){
        quadro_selecionado.lista_de_tarefas.splice(pos, 1);
    }
    limpar_selecao();
    salvar_estado();
    mostrar_tarefas();
    atualizar_estado_formulario();
})

config_select_display.onchange = ev => {
    modo_listagem = ev.target.value;
    mostrar_tarefas();
};

//================

//selection helpers
function atualizar_estado_formulario() {
    const quantidade = contar_selecionadas();
    const tarefa_unica = quantidade === 1 ? tarefas_selecionadas[0] : null;
    const edicao_em_lote = quantidade > 1;

    if (mensagem_edicao) {
        mensagem_edicao.hidden = !edicao_em_lote;
    }

    if (quantidade === 0) {
        input_nome_tarefa.disabled = false;
        input_nome_tarefa.value = "";
        select_status.disabled = false;
        select_status.value = "TODO";
        input_categoria.disabled = false;
        input_categoria.value = "";
        input_prioridade.disabled = false;
        input_prioridade.value = "1";
        input_descricao.disabled = false;
        input_descricao.value = "";
        input_alarme.disabled = false;
        input_alarme.value = "";
        check_sim_alarme.disabled = false;
        check_sim_alarme.checked = false;
        return;
    }

    if (quantidade === 1) {
        input_nome_tarefa.disabled = true;
        input_nome_tarefa.value = "";
        select_status.disabled = false;
        select_status.value = tarefa_unica.status || "TODO";
        input_categoria.disabled = false;
        input_categoria.value = tarefa_unica.categoria || "";
        input_prioridade.disabled = false;
        input_prioridade.value = String(tarefa_unica.prioridade || 1);
        input_descricao.disabled = false;
        input_descricao.value = tarefa_unica.desc || "";
        input_alarme.disabled = false;
        input_alarme.value = "";
        check_sim_alarme.disabled = false;
        check_sim_alarme.checked = false;
        return;
    }

    input_nome_tarefa.disabled = true;
    input_nome_tarefa.value = "";
    select_status.disabled = false;
    select_status.value = "TODO";
    input_categoria.disabled = false;
    input_categoria.value = "";
    input_prioridade.disabled = false;
    input_prioridade.value = "1";
    input_descricao.disabled = true;
    input_descricao.value = "";
    input_alarme.disabled = true;
    input_alarme.value = "";
    check_sim_alarme.disabled = true;
    check_sim_alarme.checked = false;
}
function selecionar_tarefa(t) {
    if (!t) {
        return;
    }

    if (quadro_selecionado && !quadro_selecionado.lista_de_tarefas.includes(t)) {
        return;
    }

    if (!tarefas_selecionadas.includes(t)) {
        tarefas_selecionadas.push(t);
    }

    tarefa_selecionada = tarefas_selecionadas.length === 1 ? tarefas_selecionadas[0] : null;
    atualizar_estado_formulario();
}
function alternar_selecao_tarefa(t) {
    if (!t) {
        return;
    }

    if (quadro_selecionado && !quadro_selecionado.lista_de_tarefas.includes(t)) {
        return;
    }

    const idx = tarefas_selecionadas.indexOf(t);
    if (idx >= 0) {
        tarefas_selecionadas.splice(idx, 1);
    } else {
        tarefas_selecionadas.push(t);
    }

    tarefa_selecionada = tarefas_selecionadas.length === 1 ? tarefas_selecionadas[0] : null;
    atualizar_estado_formulario();
}
function limpar_selecao() {
    tarefas_selecionadas = [];
    tarefa_selecionada = null;
    atualizar_estado_formulario();
}
function contar_selecionadas() {
    return tarefas_selecionadas.length;
}