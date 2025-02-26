import { Tree } from 'nx/src/generators/tree';
import { Linter, lintProjectGenerator } from '@nrwl/linter';
import { joinPathFragments } from 'nx/src/utils/path';
import { updateJson } from 'nx/src/generators/utils/json';
import { addDependenciesToPackageJson } from '@nrwl/devkit';
import { runTasksInSerial } from '@nrwl/workspace/src/utilities/run-tasks-in-serial';

import { NormalizedSchema } from '../schema';
import {
  extendReactEslintJson,
  extraEslintDependencies,
} from '../../../utils/lint';

export async function addLinting(host: Tree, options: NormalizedSchema) {
  if (options.linter === Linter.EsLint) {
    const lintTask = await lintProjectGenerator(host, {
      linter: options.linter,
      project: options.name,
      tsConfigPaths: [
        joinPathFragments(options.projectRoot, 'tsconfig.lib.json'),
      ],
      unitTestRunner: options.unitTestRunner,
      eslintFilePatterns: [`${options.projectRoot}/**/*.{ts,tsx,js,jsx}`],
      skipFormat: true,
      skipPackageJson: options.skipPackageJson,
    });

    updateJson(
      host,
      joinPathFragments(options.projectRoot, '.eslintrc.json'),
      extendReactEslintJson
    );

    let installTask = () => {};
    if (!options.skipPackageJson) {
      installTask = await addDependenciesToPackageJson(
        host,
        extraEslintDependencies.dependencies,
        extraEslintDependencies.devDependencies
      );
    }

    return runTasksInSerial(lintTask, installTask);
  } else {
    return () => {};
  }
}
