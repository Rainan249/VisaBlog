import hljs from "highlight.js/lib/core";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import sql from "highlight.js/lib/languages/sql";
import json from "highlight.js/lib/languages/json";
import yaml from "highlight.js/lib/languages/yaml";
import powershell from "highlight.js/lib/languages/powershell";
import properties from "highlight.js/lib/languages/properties";
import plaintext from "highlight.js/lib/languages/plaintext";
import bash from "highlight.js/lib/languages/bash";

/**
 * 只注册文章里实际用到的语言。
 * 全量 `highlight.js` 会把 190+ 种语言打进来（约 1MB），这里按需注册后只剩几十 KB。
 * 新增代码块语言时在下方补一行即可，别名（js/yml/html/txt）由各语言模块自带。
 */
const languages = {
  java,
  javascript,
  typescript,
  python,
  xml,
  css,
  sql,
  json,
  yaml,
  powershell,
  properties,
  plaintext,
  bash,
} as const;

for (const [name, lang] of Object.entries(languages)) {
  hljs.registerLanguage(name, lang);
}

export default hljs;
