const input_nome_novo_quadro = document.getElementById("input-nome");
const area_quadros = document.getElementById("area-quadros");

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

//config
const config_select_display = document.getElementById("select-display");

//templates
const template_container = document.getElementById("template-container");

//status
var modo_listagem = "L_STATUS";
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

function salvar_estado() {
    if (!window.todo_storage || typeof window.todo_storage.write_state !== "function") {
        return;
    }

    window.todo_storage.write_state({
        version: 1,
        boards: quadros.map(normalizar_quadro).filter(Boolean),
    });
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
    quadros = Array.isArray(dados.boards)
        ? dados.boards.map(normalizar_quadro).filter(Boolean)
        : [];
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
}

//INICIALIZACAO

function init() {
    restaurar_estado();
    renderizar_quadros();
    mostrar_tarefas();
}
init();

function usar_quadro(quadro) {
    limpar_area_tarefas();
    quadro_selecionado = quadro;
    tarefa_selecionada = null;
    mostrar_tarefas();
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
    tarefa_btn.addEventListener("click", () => {
        tarefa_selecionada = t;
        select_status.value = t.status;
        input_categoria.value = t.categoria;
        input_prioridade.value = t.prioridade;
        input_descricao.value = t.desc;
        input_nome_tarefa.value = "";
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
    const nome = input_nome_novo_quadro.value.trim();
    if (nome === "") return;

    const quadro = novo_quadro();
    quadro.nome = nome;
    quadros.push(quadro);
    salvar_estado();
    renderizar_quadros();
    input_nome_novo_quadro.value = "";
};

btn_salvar_adicionar.addEventListener("click", _ => {
    if (quadro_selecionado == null) return;

    let status = select_status.value;
    let categoria = input_categoria.value;
    let prioridade = parseInt(input_prioridade.value);
    let descricao = input_descricao.value;
    let alarme = input_alarme.value;
    let nome = input_nome_tarefa.value.trim();

    let novo_alarme_check = check_sim_alarme.checked;

    if (nome !== ""){
        let tarefa = nova_tarefa();
        tarefa.status = status;
        tarefa.categoria = categoria;
        tarefa.prioridade = prioridade;
        tarefa.desc = descricao;
        tarefa.nome = nome;
        if (novo_alarme_check && alarme !== "") tarefa.alarmes.push(alarme);
        quadro_selecionado.lista_de_tarefas.push(tarefa);
        salvar_estado();
        mostrar_tarefas();
        return;
    }

    if (tarefa_selecionada == null) return;

    tarefa_selecionada.status = status;
    tarefa_selecionada.categoria = categoria;
    tarefa_selecionada.prioridade = prioridade;
    tarefa_selecionada.desc = descricao;
    if (novo_alarme_check && alarme !== "") tarefa_selecionada.alarmes.push(alarme);
    salvar_estado();
    mostrar_tarefas();
});

btn_deletar.addEventListener("click", _ => {
    if (quadro_selecionado == null) return;
    if (tarefa_selecionada == null) return;

    let pos = quadro_selecionado.lista_de_tarefas.indexOf(tarefa_selecionada);
    if (pos >= 0){
        quadro_selecionado.lista_de_tarefas.splice(pos, 1);
    }
    tarefa_selecionada = null;
    salvar_estado();
    mostrar_tarefas();
})

config_select_display.onchange = ev => {
    modo_listagem = ev.target.value;
    mostrar_tarefas();
};

//================