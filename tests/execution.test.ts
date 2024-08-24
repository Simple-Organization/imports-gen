import { expect, test } from '@playwright/test';
import { importsGen, writes } from '../src';
import { describe } from 'node:test';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';

//
//

async function deleteIfExists(file: string) {
  if (existsSync(file)) {
    await fs.unlink(file);
  }
}

//
//

describe('importsGen execution', () => {
  test('processTsFile', async () => {
    const _writes = writes;

    await importsGen({
      glob: './tests/some-ts-files/**/*.ts',
      outFile: 'tests/results/out.ts',
    });

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(writes).toBe(_writes + 1);

    const fileContents = `import '../some-ts-files/a';
import '../some-ts-files/b';
import '../some-ts-files/c';
`;

    const contents = await fs.readFile('tests/results/out.ts', 'utf-8');

    expect(contents).toBe(fileContents);
  });

  //
  //

  test('processScssFile', async () => {
    const _writes = writes;

    await importsGen({
      glob: './tests/some-scss-files/**/*.scss',
      outFile: 'tests/results/out.scss',
    });

    expect(writes).toBe(_writes + 1);

    // wait 200ms for the process to finish
    await new Promise((resolve) => setTimeout(resolve, 10));

    const fileContents = `@import '../some-scss-files/a.scss';
@import '../some-scss-files/b.scss';
@import '../some-scss-files/c.scss';
`;

    const contents = await fs.readFile('tests/results/out.scss', 'utf-8');

    expect(contents).toBe(fileContents);
  });

  //
  //

  test('processCssFile', async () => {
    const _writes = writes;

    await importsGen({
      glob: './tests/some-css-files/**/*.css',
      outFile: 'tests/results/out.css',
    });

    expect(writes).toBe(_writes + 1);

    // wait 200ms for the process to finish
    await new Promise((resolve) => setTimeout(resolve, 150));

    const fileContents = `@import '../some-css-files/a.css';
@import '../some-css-files/b.css';
@import '../some-css-files/c.css';
`;

    const contents = await fs.readFile('tests/results/out.css', 'utf-8');

    expect(contents).toBe(fileContents);
  });

  //
  //

  test('processTsxFile', async () => {
    const _writes = writes;

    await importsGen({
      glob: './tests/some-tsx-files/**/*.(ts|tsx)',
      outFile: 'tests/results/out-tsx.ts',
    });

    expect(writes).toBe(_writes + 1);

    // wait 200ms for the process to finish
    await new Promise((resolve) => setTimeout(resolve, 150));

    const fileContents = `import '../some-tsx-files/a';
import '../some-tsx-files/b';
import '../some-tsx-files/c';
`;

    const contents = await fs.readFile('tests/results/out-tsx.ts', 'utf-8');

    expect(contents).toBe(fileContents);
  });

  //
  //

  test('Must rewrite correctly when files change', async () => {
    // Check if c.ts is present
    // if is present, remove it

    await deleteIfExists('tests/files-to-change/c.ts');

    //

    const _writes = writes;

    await importsGen({
      glob: './tests/files-to-change/**/*.(ts|tsx)',
      outFile: 'tests/results/files-changed-out.ts',
    });

    expect(writes).toBe(_writes + 1);

    //
    //
    //

    await new Promise((resolve) => setTimeout(resolve, 100));

    let fileContents = `import '../files-to-change/a';
import '../files-to-change/b';
`;

    let contents = await fs.readFile(
      'tests/results/files-changed-out.ts',
      'utf-8',
    );

    expect(contents).toBe(fileContents);

    //
    // Add a new file c.ts
    //

    await fs.writeFile(
      'tests/files-to-change/c.ts',
      'console.log("Hello, world!");',
    );

    //
    //
    //

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(writes).toBe(_writes + 2);

    fileContents = `import '../files-to-change/a';
import '../files-to-change/b';
import '../files-to-change/c';
`;

    contents = await fs.readFile('tests/results/files-changed-out.ts', 'utf-8');

    expect(contents).toBe(fileContents);

    //
    // Remove file c.ts
    //

    await fs.unlink('tests/files-to-change/c.ts');

    //
    //
    //

    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(writes).toBe(_writes + 3);

    fileContents = `import '../files-to-change/a';
import '../files-to-change/b';
`;

    contents = await fs.readFile('tests/results/files-changed-out.ts', 'utf-8');

    expect(contents).toBe(fileContents);
  });

  //
  //

  test('Should not update multiple times if many changes occor', async () => {
    //

    await deleteIfExists('tests/files-to-change-multiple/b.ts');
    await deleteIfExists('tests/files-to-change-multiple/c.ts');
    await deleteIfExists('tests/files-to-change-multiple/d.ts');

    await new Promise((resolve) => setTimeout(resolve, 100));

    //

    const _writes = writes;

    await importsGen({
      glob: './tests/files-to-change-multiple/**/*.(ts|tsx)',
      outFile: 'tests/results/files-to-change-multiple-out.ts',
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(writes).toBe(_writes + 1);

    //
    //
    //

    await new Promise((resolve) => setTimeout(resolve, 100));

    let fileContents = `import '../files-to-change-multiple/a';
`;

    let contents = await fs.readFile(
      'tests/results/files-to-change-multiple-out.ts',
      'utf-8',
    );

    expect(contents).toBe(fileContents);

    //
    // Add a new files
    //

    await fs.writeFile(
      'tests/files-to-change-multiple/b.ts',
      'console.log("Hello, world!");',
    );
    await fs.writeFile(
      'tests/files-to-change-multiple/c.ts',
      'console.log("Hello, world!");',
    );
    await fs.writeFile(
      'tests/files-to-change-multiple/d.ts',
      'console.log("Hello, world!");',
    );

    //
    //
    //

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(writes).toBe(_writes + 2);

    fileContents = `import '../files-to-change-multiple/a';
import '../files-to-change-multiple/b';
import '../files-to-change-multiple/c';
import '../files-to-change-multiple/d';
`;

    contents = await fs.readFile(
      'tests/results/files-to-change-multiple-out.ts',
      'utf-8',
    );

    expect(contents).toBe(fileContents);

    //
    // Remove file c.ts
    //

    await fs.unlink('tests/files-to-change-multiple/b.ts');
    await fs.unlink('tests/files-to-change-multiple/c.ts');
    await fs.unlink('tests/files-to-change-multiple/d.ts');

    //
    //
    //

    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(writes).toBe(_writes + 3);

    fileContents = `import '../files-to-change-multiple/a';
`;

    contents = await fs.readFile(
      'tests/results/files-to-change-multiple-out.ts',
      'utf-8',
    );

    expect(contents).toBe(fileContents);
  });
});
