# Relatório de uso com IA:

- Consumo aproximado de tokens por etapa: 200000

- Lista de deslizes:
    - Uso de PASCALCASE mesmo tendo sido especificado SNAKECASE em AGENTS.md 
    - Arquivos de frontend/ sendo colocados na raiz do repositório
    - Marcando uma tarefa como pronta antes da minha verificação

    Soluções:

    - Iniciei uma nova seção e reinforcei que os padrões de AGENTS.md deveriam ser seguidos
    - Solicitei para que fosse seguido a parte de FILES: do plan.md
    - Todas as modificações de arquivos ainda tinham que ser confirmadas por mim, neguei a alteração e reinforcei que era uma tarefa minha.

- Lista de grandes problemas:

    - Usando um modelo pior, a implementacao da task #1 de docs/plans/selecionar_varias foi custosa...
    Além da implementação ter sido produzida com um erro simples, o agente marcou um teste que não passava e que não refletia a implementação como correto...
    - Por cima disso, não resolvi o problema da forma correta. Fiquei preso num loop PROMPT -> RESPOSTA que por umas 5 mensagems minhas que não fez nada, e ainda resolvi o teste manualmente (perdi a paciência com o bot e modifiquei o teste)
    - No fim de tudo, a task estava completa. Iniciei uma nova seção e reinforcei a documentação para controlar o agente.