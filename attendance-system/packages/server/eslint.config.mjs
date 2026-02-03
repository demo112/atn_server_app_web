import rootConfig from '../../eslint.config.mjs';
import globals from "globals";

export default [
  ...rootConfig,
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: { globals: globals.node },
    rules: {
        // Server 特有规则
        "no-console": "error", // Server 端严格禁止 console.log
    }
  },
  {
    ignores: ["dist/", "coverage/", "node_modules/"]
  }
];
