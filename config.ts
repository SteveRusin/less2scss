import { join } from "path";

const folderPath = [
  "folder",
].join("/");

export const initialPath = join(
  __dirname,
  "relative path to project",
  folderPath
);
