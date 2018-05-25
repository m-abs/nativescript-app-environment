'use strict'

import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

const fileExistAsync = promisify(fs.exists);
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

interface ArgvOptions {
  [key: string]: boolean | string | number | ArgvOptions;
}

function fixArgvs(data: ArgvOptions): ArgvOptions {
  for (const key of Object.keys(data)) {
    const value = data[key];
    if (typeof value === 'object') {
      data[key] = fixArgvs(value);
      continue;
    }

    if (typeof value === 'string') {
      if (value === 'false') {
        data[key] = false;
        continue;
      }

      if (value === 'true') {
        data[key] = true;
        continue;
      }

      if (/^[1-9]+[0-9]*(\.[0-9]+)?$/.test(value)) {
        data[key] = Number(value);
        continue;
      }

      try {
        data[key] = JSON.parse(value);
      } catch {}
    }
  }

  return data;
}

const argvEnvKey = 'app';

const logPrefix = 'NativeScript Environment: ';
function processArgv($logger: Console, argv: any) {
  if (!argv || !argv.env) {
    $logger.info(`${logPrefix} tns run <platform> --env not provided.`);
    return {};
  }

  const env = argv.env;
  if (argvEnvKey in env) {
    return fixArgvs(env[argvEnvKey] as ArgvOptions);
  } else {
    $logger.info(`${logPrefix} no --env.app variables.`);
    return {};
  }
}

export = async function beforePrepare($logger: any, $projectData: any) {
  const appPath = $projectData.appDirectoryPath;
  const $options = $projectData.$options;

  const appEnvironment = processArgv($logger, $options.argv);

  const configFilepath = path.join(appPath, 'environment.json');

  let oldAppEnvironmentJSON = null;
  if (await fileExistAsync(configFilepath)) {
    oldAppEnvironmentJSON = await readFileAsync(configFilepath, { encoding: 'UTF-8' });
  }

  const appEnvironmentJSON = JSON.stringify(appEnvironment || {}, null, 2);
  if (oldAppEnvironmentJSON && oldAppEnvironmentJSON === appEnvironmentJSON) {
    $logger.info(`${logPrefix} Environment vars not changed`);
    return;
  }

  await writeFileAsync(configFilepath, appEnvironmentJSON);
  $logger.info(`${logPrefix} Successfully created:`, configFilepath);
};
