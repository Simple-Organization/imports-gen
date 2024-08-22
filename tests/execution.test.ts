import { expect, test } from '@playwright/test';
import { importsGen } from '../src';
import { describe } from 'node:test';
import fs from 'node:fs';

//
//

describe('importsGen execution', () => {
  test('processTsFile', async () => {
    importsGen({
      glob: './tests/some-ts-files/**/*.ts',
      outFile: 'tests/results/out.ts',
    });

    // wait 200ms for the process to finish
    await new Promise((resolve) => setTimeout(resolve, 150));

    const fileContents = `import '../some-ts-files/a';
import '../some-ts-files/b';
import '../some-ts-files/c';
`;

    const contents = fs.readFileSync('tests/results/out.ts', 'utf-8');

    expect(contents).toBe(fileContents);
  });

  //
  //

  test('processScssFile', async () => {
    importsGen({
      glob: './tests/some-scss-files/**/*.scss',
      outFile: 'tests/results/out.scss',
    });

    // wait 200ms for the process to finish
    await new Promise((resolve) => setTimeout(resolve, 150));

    const fileContents = `@import '../some-scss-files/a.scss';
@import '../some-scss-files/b.scss';
@import '../some-scss-files/c.scss';
`;

    const contents = fs.readFileSync('tests/results/out.scss', 'utf-8');

    expect(contents).toBe(fileContents);
  });

  //
  //

  test('processCssFile', async () => {
    importsGen({
      glob: './tests/some-css-files/**/*.css',
      outFile: 'tests/results/out.css',
    });

    // wait 200ms for the process to finish
    await new Promise((resolve) => setTimeout(resolve, 150));

    const fileContents = `@import '../some-css-files/a.css';
@import '../some-css-files/b.css';
@import '../some-css-files/c.css';
`;

    const contents = fs.readFileSync('tests/results/out.css', 'utf-8');

    expect(contents).toBe(fileContents);
  });

  //
  //

  test('processTsxFile', async () => {
    importsGen({
      glob: './tests/some-tsx-files/**/*.(ts|tsx)',
      outFile: 'tests/results/out-tsx.ts',
    });

    // wait 200ms for the process to finish
    await new Promise((resolve) => setTimeout(resolve, 150));

    const fileContents = `import '../some-tsx-files/a';
import '../some-tsx-files/b';
import '../some-tsx-files/c';
`;

    const contents = fs.readFileSync('tests/results/out-tsx.ts', 'utf-8');

    expect(contents).toBe(fileContents);
  });
});

// './tests/some-ts-files/a.ts'
// 'tests/results/out.ts'
// '../some-ts-files/a'
