const bunAdapter = () => {
  if (typeof globalThis.navigator === "undefined") {
    globalThis.navigator = {
      userAgent: "Bun"
    };
  } else {
    Object.defineProperty(globalThis.navigator, "userAgent", {
      value: "Bun",
      writable: false
    });
  }
  return {
    env: process.env
  };
};
var bun_default = bunAdapter;
export {
  bunAdapter,
  bun_default as default
};
