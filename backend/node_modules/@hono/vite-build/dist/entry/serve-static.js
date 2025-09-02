const serveStaticHook = (appName, options) => {
  let code = "";
  for (const path of options.filePaths ?? []) {
    code += `${appName}.use('${path}', serveStatic({ root: '${options.root ?? "./"}' }))
`;
  }
  return code;
};
export {
  serveStaticHook
};
