import { watch, type FSWatcher, type WatchOptions } from 'chokidar';
import fs from 'node:fs/promises';
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
  /**
   * Glob to process
   */
  glob: string;

  /**
   * Output file
   */
  outFile: string;

  /**
   * Process function to generate the output
   */
  process?: ProcessFunction;

  /**
   * Options for chokidar
   */
  chokidar?: WatchOptions;

  /**
   * Whether to watch the files or not
   */
  watch?: boolean;
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

/**
 * Generate imports for a list of files
 * @returns Returns a watcher if watch is true, otherwise returns null
 */
export async function importsGen(
  options: ImportsGenOptions,
): Promise<FSWatcher | null> {
  let process = options.process!;
  let outFile = options.outFile!;
  let lastFileOutput = '';
  let files: string[] = [];
  let ready = false;
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
    let output = processOutput(files, process, outFile);

    //
    // Corrigimos o problema do windows de gerar barras \ ao invés de /
    output = output.replace(/\\/g, '/');

    if (output === lastFileOutput) {
      return;
    }

    lastFileOutput = output;

    fs.writeFile(outFile, output);

    writes++;
  }

  //
  //

  function processFiles() {
    clearTimeout(timeout);
    timeout = setTimeout(writeOutput, 10);
  }

  //
  // Watch the files

  let watcher = watch(options.glob, options.chokidar);

  watcher.on('add', (path) => {
    files.push(path);

    if (ready) {
      processFiles();
    }
  });

  watcher.on('unlink', (path) => {
    files = files.filter((file) => file !== path);

    if (ready) {
      processFiles();
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

  if (!options.watch) {
    watcher.close();
    watcher = null as any;
    return null;
  }

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
