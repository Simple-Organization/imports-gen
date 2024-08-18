# glhera-imports

Projeto simples para gerar arquivos de imports facilmente

Essa lib serve para gerar automaticamente arquivos como esse:

```ts
import './api/rota-usuarios';
import './api/rota-empresas';
import './api/rota-emprestimos';
```

Ou esse

```scss
@import './components/EmbededAlert.scss';
@import './components/FormControl.scss';
@import './components/Dialog.scss';
```

Dessa maneira não precisa configurar um bundler como o `esbuild` para automaticamente importar tudo

Também não precisa configurar `tests runners` como o `playwright` que não vai suportar com glob `import '**/*.ts'`

## Roadmap

1. Fazer um `cli` quando eu não estiver com preguiça
2. Renomear para um nome que não tenha `glhera-`, talvez outro stack, sei lá seguindo o padrão do [`TanStack`](https://tanstack.com/)
3. Atualizar a documentação para inglês quando eu não estiver com preguiça
