# Documentação obrigatória

Sempre que qualquer arquivo, funcionalidade, configuração, endpoint, entidade,
script, tela, dependência ou processo do projeto for alterado, atualize também
[`docs/documentacao-sprint2.md`](../docs/documentacao-sprint2.md) na mesma
entrega.

- Atualize a seção correspondente ao comportamento atual.
- Mantenha status, endpoints, comandos, pendências e evidências sincronizados.
- Não registre senhas, tokens ou chaves privadas.
- Se não houver seção adequada, crie uma subseção objetiva.
- Não considere a tarefa concluída enquanto a documentação geral não refletir
  a alteração.

# Política de Git

- Não criar commits ou executar `git push` sem solicitação explícita do usuário.
- Quando solicitado, criar commits e executar pushes sem adicionar trailers de
  coautoria, incluindo `Co-authored-by`.
- Não versionar `.env`, senhas, tokens, chaves privadas ou outros segredos.
- Antes de um commit, revisar os arquivos staged e executar `git diff --check`.