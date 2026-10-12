# Seleção múltipla e edição em lote de tarefas

## Descrição

### O que foi feito

- Adicionada seleção de várias tarefas no frontend com Control-clique no Windows/Linux e Command-clique no macOS. Um clique simples seleciona uma única tarefa; tarefas selecionadas recebem destaque visual.
- O editor agora se adapta à quantidade de tarefas selecionadas: sem seleção, fica em estado neutro; com uma tarefa, exibe seus dados; com várias, informa o modo de edição em lote.
- Na edição em lote, categoria, prioridade e status podem ser alterados para todas as tarefas selecionadas. Nome, descrição e alarmes não podem ser alterados nesse modo.
- A seleção é mantida após a atualização em lote e limitada ao quadro ativo; ações de edição e exclusão de uma única tarefa continuam disponíveis no fluxo individual.
- Incluídos testes de navegador com Playwright para seleção, destaque, estados do editor e edição em lote. A suíte compartilhada também executa os testes de LocalStorage e o teste smoke.
- O aplicativo Java e sua persistência não foram alterados.

### Como testar

Na pasta `frontend/`:

```bash
npm ci
npx playwright install chromium
npm test
```

**Resultado verificado:** 10 testes passaram.

### Critérios de aceite atendidos

- É possível selecionar e alternar várias tarefas usando Control-clique ou Command-clique; a seleção recebe destaque visual.
- O editor diferencia os estados sem seleção, com uma tarefa e com várias tarefas; o nome permanece não editável.
- Na edição em lote, somente categoria, prioridade e status ficam disponíveis; descrição e controles de alarme são desabilitados.
- Ao salvar, os valores de categoria, prioridade e status são aplicados a todas as tarefas selecionadas, e o modelo e a lista refletem as alterações.
- A suíte automatizada cobre estado e interação de seleção, estados do editor, atualização em lote e o smoke test do frontend.

O critério da spec que determina aplicação imediata ao alterar cada campo não é atendido: nesta implementação, as alterações em lote só são aplicadas ao clicar em Salvar, conforme definido no plano de implementação. A aplicação Java não foi modificada.
