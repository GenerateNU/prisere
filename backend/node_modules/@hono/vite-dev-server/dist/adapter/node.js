const nodeAdapter = () => {
  if (typeof globalThis.navigator === "undefined") {
    globalThis.navigator = {
      userAgent: "Node.js"
    };
  } else {
    Object.defineProperty(globalThis.navigator, "userAgent", {
      value: "Node.js",
      writable: false
    });
  }
  return {
    env: process.env
  };
};
var node_default = nodeAdapter;
export {
  node_default as default,
  nodeAdapter
};
