# imports-gen

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

## Exemplo de uso

```ts
// Observa os arquivos da pasta tests
// e salva o arquivo de imports no arquivo result/out.ts
const watcher = importsGen({
  glob: './tests/**/*.(ts|tsx)',
  outFile: 'result/out.ts',
});

// Depois para fechar
watcher.close();
```

### chokidar

`imports-gen` usa o [chokidar](https://github.com/paulmillr/chokidar) e retorna uma instancia dele

Você pode configurar o chokidar seguindo o exemplo abaixo

```ts
importsGen({
  glob: './tests/**/*.ts',
  outFile: 'result/out.ts',
  chokidar: {
    // ... Options do chokidar
  },
});
```

### process

Para gerar imports costumizáveis você pode criar uma função `process` e usá-la como o exemplo abaixo

```ts
function processImportDynamic(file: string, output: string) {
  const result = getRelativePath(file, output);

  return `import('${result.replace(/\.tsx?$/, '')})';\n`;
}

importsGen({
  glob: './tests/**/*.scss',
  outFile: 'result/out.ts',
  process: processImportDynamic,
});

//
// Geraria
// import('./exemple');
```

## Roadmap

1. Fazer um `cli` quando eu ter mais tempo
2. Atualizar a documentação para inglês quando eu ter mais tempo
