import { watch, type FSWatcher, type WatchOptions } from 'chokidar';
import fs from 'node:fs';
import path from 'node:path';

//
//

export interface GLHeraImportOptions {
  //
  glob: string;
  outFile: string;

  process?: (file: string) => void;

  chokidar?: WatchOptions;
}

//
//

export function glheraImportStart(options: GLHeraImportOptions): FSWatcher {
  let process = options.process;
  let lastFileOutput = '';
  let files: string[] = [];
  let timeout: any;

  //
  // Configure the process function

  if (!process) {
    if (/\.(tsx?|jsx?)$/.test(options.glob)) {
      process = processTsFile;
    } else if (/\.(scss|css)$/.test(options.glob)) {
      process = processScssFile;
    }
  }

  if (!process) {
    throw new Error('No process function detected');
  }

  //
  //

  function writeOutput() {
    const output = files.map(process!).join();

    if (output === lastFileOutput) {
      return;
    }

    lastFileOutput = output;

    fs.writeFile(options.outFile, output, (err) => {
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

function processTsFile(file: string) {
  return `import '${file}';\n`;
}

//
//

function processScssFile(file: string) {
  return `@import '${file}';\n`;
}
