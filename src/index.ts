import { watch, type FSWatcher, type WatchOptions } from 'chokidar';
import fs from 'node:fs';
import path from 'node:path';

//
//

export type ProcessFunction = (file: string, outFile: string) => string;

//
//

export interface GLHeraImportOptions {
  //
  glob: string;
  outFile: string;

  process?: ProcessFunction;

  chokidar?: WatchOptions;
}

//
//

export function processOutput(
  files: string[],
  process: ProcessFunction,
  outFile: string,
) {
  return files.map((file) => process(file, outFile)).join('');
}

//
//

export function importsGen(options: GLHeraImportOptions): FSWatcher {
  let process = options.process!;
  let outFile = options.outFile!;
  let lastFileOutput = '';
  let files: string[] = [];
  let timeout: any;

  //
  // Configure the process function

  if (!process) {
    if (/\.(tsx?|jsx?)$/.test(outFile)) {
      process = processTsFile;
    } else if (/\.(scss|css)$/.test(outFile)) {
      process = processScssFile;
    }
  }

  if (!process) {
    throw new Error('No process function detected');
  }

  if (!outFile) {
    throw new Error('No outFile detected');
  }

  //
  //

  function writeOutput() {
    const output = processOutput(files, process, outFile);

    if (output === lastFileOutput) {
      return;
    }

    lastFileOutput = output;

    fs.writeFile(outFile, output, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }

  //
  //

  function processFiles() {
    clearTimeout(timeout);
    timeout = setTimeout(writeOutput, 100);
  }

  //
  // Watch the files

  const watcher = watch(options.glob, options.chokidar);

  watcher.on('add', (path) => {
    files.push(path);
    processFiles();
  });

  watcher.on('change', (path) => {
    files = files.filter((file) => file !== path);
    files.push(path);
    processFiles();
  });

  watcher.on('unlink', (path) => {
    files = files.filter((file) => file !== path);
    processFiles();
  });

  //
  //

  return watcher;
}

//
//

export function getRelativePath(file: string, outFile: string) {
  const dirFile = path.dirname(file);
  const dirOutFile = path.dirname(outFile);

  const filename = path.basename(file);

  const relative = path.relative(dirOutFile, dirFile);

  if (relative === '') {
    return './' + filename;
  }

  if (relative.startsWith('..')) {
    return relative + '/' + filename;
  }

  throw new Error('Invalid relative path');
}

//
//

export function processTsFile(file: string, output: string) {
  const result = getRelativePath(file, output);

  return `import '${result.replace(/\.tsx?$/, '')}';\n`;
}

//
//

export function processScssFile(file: string, output: string) {
  const result = getRelativePath(file, output);

  return `@import '${result}';\n`;
}
