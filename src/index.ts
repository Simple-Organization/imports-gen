import { watch, type FSWatcher, type WatchOptions } from 'chokidar';
import fs from 'node:fs';
import path from 'node:path';

//
//

/**
 * Number only used for tests
 *
 * representing the number of writes outputed
 */
export let writes = 0;

//
//

export type ProcessFunction = (file: string, outFile: string) => string;

//
//

export interface ImportsGenOptions {
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

export async function importsGen(
  options: ImportsGenOptions,
): Promise<FSWatcher> {
  let process = options.process!;
  let outFile = options.outFile!;
  let lastFileOutput = '';
  let files: string[] = [];
  let ready = false;

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

  let resolve: ((value: boolean) => void) | null;
  let reject: ((reason?: any) => void) | null;

  //

  let promise: Promise<boolean> | null = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

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

    writes++;
  }

  //
  // Watch the files

  const watcher = watch(options.glob, options.chokidar);

  watcher.on('add', (path) => {
    files.push(path);

    if (ready) {
      writeOutput();
    }
  });

  watcher.on('unlink', (path) => {
    files = files.filter((file) => file !== path);

    if (ready) {
      writeOutput();
    }
  });

  watcher.once('ready', () => {
    ready = true;

    writeOutput();

    resolve!(true);

    resolve = null;
    reject = null;
    promise = null;
  });

  watcher.once('error', (error) => {
    if (reject) {
      reject(error);

      resolve = null;
      reject = null;
      promise = null;
    }
  });

  //
  //

  await promise;

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
