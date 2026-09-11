import { marked, type Tokens } from "marked";

const CALLOUT_RE = /^\s*\[!(\w+)\]([+-]?) ?([^\n]*)\n?([\s\S]*)$/;

const CALLOUT_META: Record<
  string,
  { color: string; fallback: string; icon: string }
> = {
  note: { color: "note", fallback: "Note", icon: "pencil" },
  abstract: { color: "abstract", fallback: "Abstract", icon: "clipboard" },
  summary: { color: "abstract", fallback: "Summary", icon: "clipboard" },
  tldr: { color: "abstract", fallback: "TL;DR", icon: "clipboard" },
  info: { color: "info", fallback: "Info", icon: "info" },
  todo: { color: "todo", fallback: "Todo", icon: "todo" },
  tip: { color: "tip", fallback: "Tip", icon: "bulb" },
  hint: { color: "tip", fallback: "Hint", icon: "bulb" },
  important: { color: "tip", fallback: "Important", icon: "bulb" },
  success: { color: "success", fallback: "Success", icon: "check" },
  check: { color: "success", fallback: "Check", icon: "check" },
  done: { color: "success", fallback: "Done", icon: "check" },
  question: { color: "question", fallback: "Question", icon: "question" },
  help: { color: "question", fallback: "Help", icon: "question" },
  faq: { color: "question", fallback: "FAQ", icon: "question" },
  warning: { color: "warning", fallback: "Warning", icon: "warn" },
  caution: { color: "warning", fallback: "Caution", icon: "warn" },
  attention: { color: "warning", fallback: "Attention", icon: "warn" },
  danger: { color: "danger", fallback: "Danger", icon: "zap" },
  error: { color: "danger", fallback: "Error", icon: "cross" },
  failure: { color: "danger", fallback: "Failure", icon: "cross" },
  fail: { color: "danger", fallback: "Fail", icon: "cross" },
  missing: { color: "danger", fallback: "Missing", icon: "cross" },
  bug: { color: "danger", fallback: "Bug", icon: "zap" },
  example: { color: "example", fallback: "Example", icon: "list" },
  quote: { color: "quote", fallback: "Quote", icon: "quote" },
  cite: { color: "quote", fallback: "Cite", icon: "quote" },
};

const ICONS: Record<string, string> = {
  pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>',
  clipboard:
    '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><path d="M9 13l2 2 4-4"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01"/><path d="M12 11v5"/>',
  todo: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 12l2 2 4-4"/>',
  bulb: '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 016 6c0 2.2-1.2 3.2-2.2 4.2-.7.7-1.1 1.3-1.1 2.3H9.3c0-1-.4-1.6-1.1-2.3C7.2 12.2 6 11.2 6 9a6 6 0 016-6z"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
  question:
    '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 114 2c-.8.6-1.5 1-1.5 2"/><path d="M12 17h.01"/>',
  warn: '<path d="M12 4L2.5 20h19L12 4z"/><path d="M12 10v4"/><path d="M12 17h.01"/>',
  zap: '<path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H12L13 2z"/>',
  cross: '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
  list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3.5 6h.01"/><path d="M3.5 12h.01"/><path d="M3.5 18h.01"/>',
  quote:
    '<path d="M10 8c-3 0-5 2-5 5.5V18h5v-5H7.5C7.5 11 8.5 10 10 10V8z"/><path d="M19 8c-3 0-5 2-5 5.5V18h5v-5h-2.5c0-2 1-3 2.5-3V8z"/>',
};

function iconSvg(name: string, className: string): string {
  return `<svg class="${className}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${
    ICONS[name] || ICONS.info
  }</svg>`;
}

const GITHUB_ICON =
  "M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z";

const GITHUB_REPO_RE = /^\s*\[!github\]\s*([\w.-]+\/[\w.-]+)\s*$/;

function renderRepoCard(repo: string): string {
  const [owner, name] = repo.split("/");
  return `<a class="gh-repo-card" data-repo="${repo}" href="https://github.com/${repo}" target="_blank" rel="noopener noreferrer">
  <div class="gh-repo-head">
    <svg class="gh-repo-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="${GITHUB_ICON}"/></svg>
    <span class="gh-repo-name">${owner}<span class="gh-repo-sep">/</span><b>${name}</b></span>
  </div>
  <p class="gh-repo-desc">GitHub 仓库</p>
  <div class="gh-repo-meta"><span class="gh-repo-stars">★ –</span><span class="gh-repo-forks">⑂ –</span><span class="gh-repo-lang"></span></div>
</a>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

marked.use({
  renderer: {
    blockquote(token: Tokens.Blockquote): string | false {
      const repoMatch = (token.text ?? "").match(GITHUB_REPO_RE);
      if (repoMatch) return renderRepoCard(repoMatch[1]);

      const match = (token.text ?? "").match(CALLOUT_RE);
      if (!match) return false;

      const rawType = match[1].toLowerCase();
      const fold = match[2];
      const meta =
        CALLOUT_META[rawType] ||
        ({ color: "note", fallback: rawType, icon: "info" } as const);
      const title = escapeHtml(match[3].trim() || meta.fallback);
      const body = match[4] ?? "";

      const foldable = fold === "+" || fold === "-";
      const classes = [
        "callout",
        `callout--${meta.color}`,
        foldable && fold === "-" ? "callout--closed" : "",
      ]
        .filter(Boolean)
        .join(" ");

      const toggle = foldable
        ? ` onclick="this.closest('.callout').classList.toggle('callout--closed')"`
        : "";

      return `<div class="${classes}"><div class="callout-title"${toggle}>${iconSvg(
        meta.icon,
        "callout-icon"
      )}<span class="callout-title-text">${title}</span>${
        foldable
          ? '<svg class="callout-chevron" width="12" height="12" viewBox="0 0 12 12"><path d="M3 4.5L6 8l3-3.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          : ""
      }</div><div class="callout-body">${marked.parse(body)}</div></div>`;
    },
  },
});

let katexPromise: Promise<void> | null = null;

function ensureKatex(): Promise<void> {
  katexPromise ??= (async () => {
    const [{ default: markedKatex }] = await Promise.all([
      import("marked-katex-extension"),
      import("katex/dist/katex.min.css"),
    ]);
    marked.use(markedKatex({ throwOnError: false }) as never);
  })();
  return katexPromise;
}

function preprocessObsidianImages(content: string): string {
  return content.replace(
    /!\[\[([^\]]+\.(png|jpg|jpeg|gif|svg|webp|bmp))\]\]/gi,
    (_match, filename) => `![${filename}](${encodeURI(filename)})`
  );
}

function absolutizeImages(html: string): string {
  return html.replace(
    /<img\s+([^>]*?)src=(['"])((?!\/|http|data:)[^'"]+)\2/g,
    '<img loading="lazy" decoding="async" $1src="/images/$3"'
  );
}

function addLinkTargets(html: string): string {
  return html.replace(/<a\s+([^>]*?)href=(['"])(.*?)\2([^>]*?)>/g, (match, before, _q, href, after) => {
    if (/target=/.test(match)) return match;
    const isExternal = /^https?:\/\//i.test(href);
    const cls = isExternal ? ' class="external-link"' : "";
    return `<a ${before}href="${href}"${after}${cls} target="_blank" rel="noopener noreferrer">`;
  });
}

function wrapLinkPreviews(html: string): string {
  return html.replace(
    /<p>\s*<a\s+href=(['"])(https?:\/\/[^'"]+)\1\s*>([\s\S]*?)<\/a>\s*<\/p>/g,
    (_match, _q, href: string, text: string) => {
      if (/<img/i.test(text)) return _match;

      let host = href;
      try {
        host = new URL(href).hostname.replace(/^www\./, "");
      } catch {
        host = href;
      }
      const plain = text.replace(/<[^>]+>/g, "").trim() || host;
      const favicon = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
        host
      )}&sz=64`;

      return `<a class="link-preview" href="${href}" target="_blank" rel="noopener noreferrer"><img class="link-preview-icon" src="${favicon}" alt="" loading="lazy" onerror="this.style.display='none'"/><span class="link-preview-body"><span class="link-preview-title">${plain}</span><span class="link-preview-host">${host}</span></span></a>`;
    }
  );
}

function wrapCodeBlocks(html: string): string {
  return html.replace(
    /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
    (_match, lang, code) => {
      const encoded = encodeURIComponent(code);
      return `<div class="code-block-wrap">
      <div class="code-block-header">
        <span class="code-lang">${lang}</span>
        <button class="code-copy-btn" data-code="${encoded}" onclick="
          var ta=document.createElement('textarea');
          ta.innerHTML=decodeURIComponent(this.getAttribute('data-code'));
          ta.value=ta.textContent||ta.innerText||'';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          this.textContent='✓ Copied';
          setTimeout(()=>{this.textContent='Copy';},1200);
        ">Copy</button>
      </div>
      <pre><code class="language-${lang}">${code}</code></pre>
    </div>`;
    }
  );
}

export async function renderMarkdown(content: string): Promise<string> {
  const processed = preprocessObsidianImages(content);

  if (processed.includes("$")) {
    await ensureKatex();
  }

  let html = (await marked.parse(processed, { async: true })) as string;

  html = absolutizeImages(html);
  html = wrapLinkPreviews(html);
  html = addLinkTargets(html);
  html = wrapCodeBlocks(html);

  return html;
}
