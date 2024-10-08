import { expect, test } from '@playwright/test';
import {
  getRelativePath,
  processOutput,
  processScssFile,
  processTsFile,
} from '../src';
import { describe } from 'node:test';

//
//

describe('processOutput', () => {
  //
  //

  test('getRelativePath', () => {
    let relative = getRelativePath(
      'tests/testFiles/test.ts',
      'tests/testFiles/out.ts',
    );

    expect(relative).toBe(`./test.ts`);

    relative = getRelativePath(
      './tests/results/test.ts',
      './tests/testFiles/out.ts',
    );

    expect(relative).toBe(`../results/test.ts`);

    relative = getRelativePath(
      'tests/testFiles/test.ts',
      'tests/testFiles/out.ts',
    );

    expect(relative).toBe(`./test.ts`);
  });

  //
  //

  test('processTsFile', () => {
    const process = processTsFile;

    const output = processOutput(
      ['tests/testFiles/test.ts'],
      process,
      'tests/testFiles/out.ts',
    );

    expect(output).toBe(`import './test';\n`);
  });

  //
  //

  test('processScssFile', () => {
    const process = processScssFile;

    const output = processOutput(
      ['tests/testFiles/test.scss'],
      process,
      'tests/testFiles/out.scss',
    );

    expect(output).toBe(`@import './test.scss';\n`);
  });

  //
  //

  test('import dynamic process', () => {
    function processImportDynamic(file: string, output: string) {
      const result = getRelativePath(file, output);

      return `import('${result.replace(/\.tsx?$/, '')})';\n`;
    }

    const output = processOutput(
      ['tests/testFiles/test1.ts', 'tests/testFiles/test2.ts'],
      processImportDynamic,
      'tests/testFiles/out.ts',
    );

    expect(output).toBe(`import('./test1)';\nimport('./test2)';\n`);
  });
});
