import { promises, lstatSync } from "fs";
import { join } from "path";
import less2scss from "less2scss";
const { readdir, readFile, writeFile, unlink } = promises;

import { initialPath } from './config';

const recursively = true;

const styleProp = /(styleUrls:.*?\[(?<urls>.*?)\])/ims;

async function start(projectPath: string) {
  const directory = await readdir(projectPath);
  try {
    const lessFileNames = directory.filter((fileName) => isLessFile(fileName));
    const componentName = directory.find((fileName) => isComponent(fileName));

    if (lessFileNames.length) {
      const lessPath = lessFileNames.map((lessFileName) =>
        join(projectPath, lessFileName)
      );
      less2scss(lessPath.join(","), projectPath);
      await Promise.all(lessPath.map((filePath) => unlink(filePath)));
    }

    if (componentName) {
      const componentPath = join(projectPath, componentName);
      const component = await readFile(componentPath, "utf-8");
      await writeFile(componentPath, updateFilePath(component), "utf-8");
    }

    if (recursively) {
      const directories = directory
        .filter((path) => !isComponent(path))
        .filter((path) => !isLessFile(path))
        .filter((path) => isDirectory(join(projectPath, path)));

      if (directories.length) {
        return await Promise.all(
          directories.map((path) => {
            return start(join(projectPath, path));
          })
        );
      }
    }
  } catch (e) {
    console.error(e);
  }

  return Promise.resolve();
}

function updateFilePath(componentContent: string) {
  return componentContent.replace(styleProp, (matched) => {
    return matched.replace(/\.less/gm, ".scss");
  });
}

start(initialPath);

function isDirectory(source: string) {
  return lstatSync(source).isDirectory();
}

function isComponent(fileName: string) {
  return fileName.endsWith("component.ts");
}

function isLessFile(fileName: string) {
  return fileName.endsWith(".less");
}
