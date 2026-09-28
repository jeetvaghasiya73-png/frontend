/**
 * Deterministic Tag-Based Blog Parser Engine for Tech Infinix
 * Scans tags from tags.md and compiles them into the exact reference template HTML
 * (matching https://www.techinfinix.com/blogs/whatsapp-crm-bots).
 */

export interface ParsedBlog {
  title: string;
  slug: string;
  category: string;
  readTime: string;
  author: string;
  summary: string;
  coverImage: string;
  coverImageAlt: string;
  includeContactForm: boolean;
  compiledHtml: string;
  rawContent: string;
  toc: { id: string; label: string; level: number }[];
}

// Helper to generate clean URL slug
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
}

/**
 * Main Parser: Converts tagged text into structured metadata and compiled semantic HTML.
 */
export function parseTaggedBlog(rawText: string): ParsedBlog {
  if (!rawText) {
    return {
      title: "",
      slug: "",
      category: "TECH & AI FUTURE",
      readTime: "5 min read",
      author: "Tech Infinix Research Team",
      summary: "",
      coverImage: "",
      coverImageAlt: "",
      includeContactForm: true,
      compiledHtml: "",
      rawContent: "",
      toc: []
    };
  }

  let text = rawText;

  // 1. Extract Metadata Tags
  const extractSingleTag = (tag: string, defaultVal = ""): string => {
    const regex = new RegExp(`\\[${tag}\\]([\\s\\S]*?)\\[\\/${tag}\\]`, "i");
    const match = text.match(regex);
    if (match) {
      text = text.replace(regex, ""); // remove from body
      return match[1].trim();
    }
    return defaultVal;
  };

  const title = extractSingleTag("TITLE", "");
  let slug = extractSingleTag("SLUG", "");
  if (!slug && title) {
    slug = slugify(title);
  }
  const category = extractSingleTag("CATEGORY", "TECH & AI FUTURE");
  const readTime = extractSingleTag("READ_TIME", "5 min read");
  const author = extractSingleTag("AUTHOR", "Tech Infinix Automation Labs");
  const summary = extractSingleTag("SUMMARY", "");

  // Extract Cover Image
  let coverImage = "";
  let coverImageAlt = "";
  const coverImgRegex = /\[COVER_IMAGE\s+([^\]]*?)\/?\]/i;
  const coverMatch = text.match(coverImgRegex);
  if (coverMatch) {
    const attrs = coverMatch[1];
    const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
    const altMatch = attrs.match(/alt=["']([^"']+)["']/i);
    if (srcMatch) coverImage = srcMatch[1];
    if (altMatch) coverImageAlt = altMatch[1];
    text = text.replace(coverImgRegex, "");
  }

  // Extract Form Checkbox
  let includeContactForm = true;
  const formRegex = /\[INCLUDE_FORM:\s*(true|false)\]/i;
  const formMatch = text.match(formRegex);
  if (formMatch) {
    includeContactForm = formMatch[1].toLowerCase() === "true";
    text = text.replace(formRegex, "");
  }

  // 2. Compile Body Tags into High-Fidelity Template HTML
  const toc: { id: string; label: string; level: number }[] = [];
  let sectionIndex = 0;

  // Store self-contained HTML blocks in tokens to protect them from \n\n paragraph splitting
  const blocksMap = new Map<string, string>();
  let blockCounter = 0;

  const registerBlock = (html: string): string => {
    const token = `__TECH_INFINIX_BLOCK_${blockCounter++}__`;
    blocksMap.set(token, html);
    return token;
  };

  // Process [LINK] ... [/LINK] (Inline SEO Hyperlinks with flexible attribute ordering)
  text = text.replace(
    /\[LINK\s+([^\]]+?)\]([\s\S]*?)\[\/LINK\]/gi,
    (match, attrsStr, linkText) => {
      const getAttr = (name: string): string => {
        const m = attrsStr.match(new RegExp(`${name}=["']([^"']*)["']`, "i"));
        return m ? m[1] : "";
      };
      const href = getAttr("href");
      if (!href) return linkText;
      const titleAttr = getAttr("title");
      const target = getAttr("target") || "_blank";
      const rel = getAttr("rel") || (target === "_blank" ? "noopener noreferrer" : "");
      const titleTag = titleAttr ? ` title="${titleAttr.replace(/"/g, "&quot;")}"` : "";
      const relTag = rel ? ` rel="${rel}"` : "";
      return `<a href="${href}" target="${target}"${relTag}${titleTag} class="text-accent-custom font-semibold underline underline-offset-2 hover:opacity-85 transition-opacity">${linkText}</a>`;
    }
  );

  // Process [HIGHLIGHT] ... [/HIGHLIGHT]
  text = text.replace(
    /\[HIGHLIGHT(?:\s+badge=["']([^"']*)["'])?\]([\s\S]*?)\[\/HIGHLIGHT\]/gi,
    (match, badgeAttr, body) => {
      let badge = badgeAttr || "🚀 Core Insight";
      let content = body;

      // Extract [BADGE] if present inside
      const innerBadgeMatch = content.match(/\[BADGE\]([\s\S]*?)\[\/BADGE\]/i);
      if (innerBadgeMatch) {
        badge = innerBadgeMatch[1].trim();
        content = content.replace(/\[BADGE\][\s\S]*?\[\/BADGE\]/i, "");
      }

      // Extract [HEADLINE] if present inside
      let headlineHtml = "";
      const headlineMatch = content.match(/\[HEADLINE\]([\s\S]*?)\[\/HEADLINE\]/i);
      if (headlineMatch) {
        headlineHtml = `<p class="font-semibold text-foreground text-base sm:text-[17px] mb-2 leading-snug">${headlineMatch[1].trim()}</p>`;
        content = content.replace(/\[HEADLINE\][\s\S]*?\[\/HEADLINE\]/i, "");
      }

      const html = `<div class="blog-highlight-box"><div class="blog-badge mb-2.5">${badge}</div>${headlineHtml}<div class="text-xs sm:text-[13.5px] text-secondary-custom leading-relaxed m-0">${content.trim()}</div></div>`;
      return registerBlock(html);
    }
  );

  // Process [STAT_GRID] ... [/STAT_GRID] (Supports cols="2|3|4" and flexible attribute ordering)
  text = text.replace(/\[STAT_GRID(?:\s+cols=["']([^"']*)["'])?\]([\s\S]*?)\[\/STAT_GRID\]/gi, (match, colsAttr, gridContent) => {
    const statCards: string[] = [];
    const statRegex = /\[STAT\s+([^\]]+?)\/?\]/gi;
    let sMatch;
    while ((sMatch = statRegex.exec(gridContent)) !== null) {
      const attrs = sMatch[1];
      const numMatch = attrs.match(/num=["']([^"']*)["']/i);
      const labelMatch = attrs.match(/label=["']([^"']*)["']/i);
      
      const numRaw = numMatch ? numMatch[1] : "";
      const label = labelMatch ? labelMatch[1] : "";

      if (!numRaw && !label) continue;

      // Sanitize num for HTML so <3s or >90% renders cleanly without breaking DOM
      const sanitizedNum = numRaw
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      statCards.push(
        `<div class="blog-stat-card"><div class="blog-stat-number">${sanitizedNum}</div><div class="blog-stat-label">${label}</div></div>`
      );
    }

    if (statCards.length === 0) return "";
    const cols = colsAttr ? ` data-cols="${colsAttr}"` : "";
    const html = `<div class="blog-stat-grid"${cols}>\n${statCards.join("\n")}\n</div>`;
    return registerBlock(html);
  });

  // Process [SUBSECTION] ... [/SUBSECTION] (H3 Sub-headings)
  text = text.replace(
    /\[SUBSECTION(?:\s+id=["']([^"']*)["'])?(?:\s+title=["']([^"']*)["'])?\]([\s\S]*?)\[\/SUBSECTION\]/gi,
    (match, idAttr, titleAttr, subBody) => {
      const subTitle = titleAttr || "Sub-pillar";
      const subId = idAttr || slugify(subTitle);

      toc.push({
        id: subId,
        label: subTitle,
        level: 3
      });

      const h3Html = registerBlock(`<h3 id="${subId}">${subTitle}</h3>`);
      return `\n\n${h3Html}\n\n${subBody.trim()}\n\n`;
    }
  );

  // Standalone / self-closing [SUBSECTION title="..." /]
  text = text.replace(
    /\[SUBSECTION\s+([^\]]+?)\/?\]/gi,
    (match, attrsStr) => {
      const getAttr = (name: string): string => {
        const m = attrsStr.match(new RegExp(`${name}=["']([^"']*)["']`, "i"));
        return m ? m[1] : "";
      };
      const subTitle = getAttr("title") || "Sub-pillar";
      const subId = getAttr("id") || slugify(subTitle);
      toc.push({ id: subId, label: subTitle, level: 3 });
      const h3Html = registerBlock(`<h3 id="${subId}">${subTitle}</h3>`);
      return `\n\n${h3Html}\n\n`;
    }
  );

  // Process [SECTION] ... [/SECTION] (H2 Chapter Headings)
  text = text.replace(
    /\[SECTION(?:\s+id=["']([^"']*)["'])?(?:\s+title=["']([^"']*)["'])?\]([\s\S]*?)\[\/SECTION\]/gi,
    (match, idAttr, titleAttr, sectionBody) => {
      sectionIndex++;
      const secTitle = titleAttr || `Chapter ${sectionIndex}`;
      const secId = idAttr || slugify(secTitle) || `section-${sectionIndex}`;

      toc.push({
        id: secId,
        label: secTitle,
        level: 2
      });

      const h2Html = registerBlock(`<h2 id="${secId}">${secTitle}</h2>`);
      return `\n\n${h2Html}\n\n${sectionBody.trim()}\n\n`;
    }
  );

  // Standalone / self-closing [SECTION title="..." /]
  text = text.replace(
    /\[SECTION\s+([^\]]+?)\/?\]/gi,
    (match, attrsStr) => {
      const getAttr = (name: string): string => {
        const m = attrsStr.match(new RegExp(`${name}=["']([^"']*)["']`, "i"));
        return m ? m[1] : "";
      };
      sectionIndex++;
      const secTitle = getAttr("title") || `Chapter ${sectionIndex}`;
      const secId = getAttr("id") || slugify(secTitle) || `section-${sectionIndex}`;
      toc.push({ id: secId, label: secTitle, level: 2 });
      const h2Html = registerBlock(`<h2 id="${secId}">${secTitle}</h2>`);
      return `\n\n${h2Html}\n\n`;
    }
  );

  // Process [IMAGE_GRID] ... [/IMAGE_GRID] (2 or 3 images side-by-side)
  text = text.replace(
    /\[IMAGE_GRID(?:\s+cols=["']([^"']*)["'])?\]([\s\S]*?)\[\/IMAGE_GRID\]/gi,
    (match, colsAttr, innerBody) => {
      const cols = colsAttr === "3" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2";
      const html = `<div class="my-6 grid ${cols} gap-4 items-start blog-image-grid">\n${innerBody.trim()}\n</div>`;
      return registerBlock(html);
    }
  );

  // Process [IMAGE] tags (Flexible attribute order: src, alt, caption, layout, text, headline, width)
  text = text.replace(/\[IMAGE\s+([^\]]+?)\/?\]/gi, (match, attrsStr) => {
    const getAttr = (name: string): string => {
      const m = attrsStr.match(new RegExp(`${name}=["']([^"']*)["']`, "i"));
      return m ? m[1] : "";
    };

    const rawSrc = getAttr("src");
    if (!rawSrc) return match; // Not a valid image tag without src

    // URL Normalization: handle relative paths like "images/blogs/..." -> "/images/blogs/..."
    let cleanSrc = rawSrc.trim();
    if (
      !cleanSrc.startsWith("http://") &&
      !cleanSrc.startsWith("https://") &&
      !cleanSrc.startsWith("/") &&
      !cleanSrc.startsWith("data:")
    ) {
      cleanSrc = "/" + cleanSrc;
    }

    const alt = getAttr("alt");
    const caption = getAttr("caption");
    const headline = getAttr("headline");
    const textContent = getAttr("text") || getAttr("content");
    const layoutMode = (getAttr("layout") || "full").toLowerCase();
    const customWidth = getAttr("width");
    const cleanAlt = alt ? alt.replace(/"/g, "&quot;") : "Tech Infinix Visual";

    const widthStyle = customWidth ? ` style="max-width: ${customWidth}; margin-left: auto; margin-right: auto;"` : "";

    // Sleek inline fallback displayed if image URL fails to load (no broken browser icons)
    const fallbackHtml = `<div class="blog-img-fallback hidden" style="display: none;"><svg class="w-8 h-8 opacity-40 text-accent-custom" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><span class="text-xs font-mono font-medium text-foreground">${cleanAlt}</span><span class="text-[10px] font-mono text-secondary-custom/60">Image verifying: ${cleanSrc}</span></div>`;

    const captionHtml = caption
      ? `<div class="p-2.5 bg-surface text-center border-t border-border-custom/50 text-[11px] text-secondary-custom font-mono">${caption}</div>`
      : "";

    let html = "";
    if (layoutMode === "centered") {
      html = `<div class="my-6 max-w-2xl mx-auto blog-image-wrapper layout-centered" data-layout="centered"${widthStyle}><img src="${cleanSrc}" alt="${cleanAlt}" class="w-full h-auto object-cover" loading="lazy" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" />${fallbackHtml}${captionHtml}</div>`;
    } else if (layoutMode === "split-left") {
      html = `<div class="blog-image-wrapper layout-split-left" data-layout="split-left"${widthStyle}><div class="blog-split-image-pane"><img src="${cleanSrc}" alt="${cleanAlt}" class="w-full h-auto object-cover max-h-[380px]" loading="lazy" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" />${fallbackHtml}</div><div class="blog-split-text-pane">${headline ? `<h4 class="text-sm font-semibold text-foreground mb-1 leading-snug">${headline}</h4>` : ""}${textContent ? `<p class="text-xs text-secondary-custom leading-relaxed m-0">${textContent}</p>` : ""}${caption ? `<div class="font-mono text-[11px] text-secondary-custom/90 italic pt-1 border-t border-border-custom/30">${caption}</div>` : ""}</div></div>`;
    } else if (layoutMode === "split-right") {
      html = `<div class="blog-image-wrapper layout-split-right" data-layout="split-right"${widthStyle}><div class="blog-split-text-pane">${headline ? `<h4 class="text-sm font-semibold text-foreground mb-1 leading-snug">${headline}</h4>` : ""}${textContent ? `<p class="text-xs text-secondary-custom leading-relaxed m-0">${textContent}</p>` : ""}${caption ? `<div class="font-mono text-[11px] text-secondary-custom/90 italic pt-1 border-t border-border-custom/30">${caption}</div>` : ""}</div><div class="blog-split-image-pane"><img src="${cleanSrc}" alt="${cleanAlt}" class="w-full h-auto object-cover max-h-[380px]" loading="lazy" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" />${fallbackHtml}</div></div>`;
    } else if (layoutMode === "card") {
      html = `<div class="blog-image-wrapper layout-card my-6"${widthStyle}><img src="${cleanSrc}" alt="${cleanAlt}" class="w-full h-auto aspect-[16/9] object-cover" loading="lazy" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" />${fallbackHtml}<div class="p-4 space-y-1.5 bg-surface border-t border-border-custom">${headline ? `<h4 class="text-sm font-semibold text-foreground">${headline}</h4>` : ""}${textContent ? `<p class="text-xs text-secondary-custom leading-relaxed m-0">${textContent}</p>` : ""}${caption ? `<div class="text-[11px] font-mono text-secondary-custom/80 italic pt-1">${caption}</div>` : ""}</div></div>`;
    } else if (layoutMode === "inline-left") {
      html = `<div class="my-4 md:float-left md:mr-6 md:mb-4 max-w-xs blog-image-wrapper layout-inline-left" data-layout="inline-left"><img src="${cleanSrc}" alt="${cleanAlt}" class="w-full h-auto object-cover" loading="lazy" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" />${fallbackHtml}${captionHtml}</div>`;
    } else if (layoutMode === "inline-right") {
      html = `<div class="my-4 md:float-right md:ml-6 md:mb-4 max-w-xs blog-image-wrapper layout-inline-right" data-layout="inline-right"><img src="${cleanSrc}" alt="${cleanAlt}" class="w-full h-auto object-cover" loading="lazy" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" />${fallbackHtml}${captionHtml}</div>`;
    } else {
      // Default: Full width 16:9 banner
      html = `<div class="my-6 blog-image-wrapper layout-full" data-layout="full"${widthStyle}><img src="${cleanSrc}" alt="${cleanAlt}" class="w-full h-auto aspect-[16/9] object-cover" loading="lazy" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" />${fallbackHtml}${captionHtml}</div>`;
    }

    return registerBlock(html);
  });

  // Process [TABLE] ... [/TABLE] with automatic Mobile Card Conversion (data-label injection)
  text = text.replace(/\[TABLE\]([\s\S]*?)\[\/TABLE\]/gi, (match, tableContent) => {
    const rawLines = tableContent
      .trim()
      .split("\n")
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0 && !/^[\s|:-]+$/.test(l));

    if (rawLines.length === 0) return "";

    const parsePipeRow = (line: string) =>
      line
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((c: string) => c.trim());

    const headers = parsePipeRow(rawLines[0]);
    const bodyRows = rawLines.slice(1).map(parsePipeRow);

    const theadHtml = `<thead><tr>${headers.map((h: string) => `<th>${h}</th>`).join("")}</tr></thead>`;
    const tbodyHtml = `<tbody>${bodyRows
      .map(
        (row: string[]) => `<tr>${row
          .map((cell: string, idx: number) => {
            const domainClass = idx === 0 ? ' class="domain-cell"' : "";
            const dataLabel = headers[idx] ? ` data-label="${headers[idx]}"` : "";
            return `<td${domainClass}${dataLabel}>${cell}</td>`;
          })
          .join("")}</tr>`
      )
      .join("")}</tbody>`;

    const html = `<div class="blog-table-wrapper"><table class="blog-table">${theadHtml}${tbodyHtml}</table></div>`;
    return registerBlock(html);
  });

  // Process [QUOTE] ... [/QUOTE]
  text = text.replace(
    /\[QUOTE(?:\s+author=["']([^"']*)["'])?\]([\s\S]*?)\[\/QUOTE\]/gi,
    (match, authorAttr, quoteBody) => {
      const attribution = authorAttr
        ? `<span class="text-[10px] font-mono text-secondary-custom uppercase tracking-wider">— ${authorAttr}</span>`
        : "";
      const html = `<div class="blog-quote-box"><p class="italic text-foreground font-medium text-xs sm:text-[13px] mb-1 leading-relaxed">${quoteBody.trim()}</p>${attribution}</div>`;
      return registerBlock(html);
    }
  );

  // Process [CALLOUT] ... [/CALLOUT]
  text = text.replace(
    /\[CALLOUT(?:\s+type=["']([^"']*)["'])?\]([\s\S]*?)\[\/CALLOUT\]/gi,
    (match, calloutType, body) => {
      const type = calloutType || "info";
      let headlineHtml = "";
      let content = body;

      const headlineMatch = content.match(/\[HEADLINE\]([\s\S]*?)\[\/HEADLINE\]/i);
      if (headlineMatch) {
        headlineHtml = `<p class="font-bold text-foreground text-xs uppercase font-mono tracking-wider mb-1.5">${headlineMatch[1].trim()}</p>`;
        content = content.replace(/\[HEADLINE\][\s\S]*?\[\/HEADLINE\]/i, "");
      }

      const html = `<div class="blog-callout blog-callout-${type}">${headlineHtml}<div class="text-xs leading-relaxed text-secondary-custom">${content.trim()}</div></div>`;
      return registerBlock(html);
    }
  );

  // Process [CODE] ... [/CODE]
  text = text.replace(
    /\[CODE(?:\s+lang=["']([^"']*)["'])?\]([\s\S]*?)\[\/CODE\]/gi,
    (match, lang, codeBody) => {
      const language = lang ? ` class="language-${lang}"` : "";
      const html = `<pre class="blog-code-block my-4 p-4 rounded-[3px] bg-surface border border-border-custom overflow-x-auto text-xs font-mono text-foreground leading-relaxed"><code${language}>${codeBody.trim()}</code></pre>`;
      return registerBlock(html);
    }
  );

  // Process [SPLIT ratio="..."] ... [/SPLIT] (Side-by-side multi-column container)
  text = text.replace(
    /\[SPLIT(?:\s+ratio=["']([^"']*)["'])?\]([\s\S]*?)\[\/SPLIT\]/gi,
    (match, ratioAttr, splitBody) => {
      const ratio = ratioAttr || "50-50";
      const colRegex = /\[COL\]([\s\S]*?)\[\/COL\]/gi;
      const cols: string[] = [];
      let cMatch;
      while ((cMatch = colRegex.exec(splitBody)) !== null) {
        const colInner = cMatch[1].trim();
        const colBlocks = colInner.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
        const compiledCol = colBlocks.map((b) => {
          if (b.startsWith("__TECH_INFINIX_BLOCK_") || b.startsWith("<")) return b;
          if (b.startsWith("- ") || b.startsWith("* ")) {
            const items = b
              .split("\n")
              .map((line) => line.replace(/^[-*]\s+/, "").trim())
              .filter(Boolean)
              .map((item) => `<li>${item}</li>`)
              .join("\n  ");
            return `<ul class="space-y-1.5 my-2.5">\n  ${items}\n</ul>`;
          }
          if (/\n\s*[-*]\s+/.test(b)) {
            const lines = b.split("\n");
            const textLines: string[] = [];
            const listItems: string[] = [];
            let inList = false;
            for (const line of lines) {
              if (/^[-*]\s+/.test(line.trim())) {
                inList = true;
                listItems.push(`<li>${line.trim().replace(/^[-*]\s+/, "")}</li>`);
              } else if (!inList) {
                textLines.push(line);
              } else {
                listItems.push(`<li>${line.trim()}</li>`);
              }
            }
            const pPart = textLines.length > 0 ? `<p>${textLines.join(" ").trim()}</p>\n\n` : "";
            const ulPart = `<ul class="space-y-1.5 my-2.5">\n  ${listItems.join("\n  ")}\n</ul>`;
            return `${pPart}${ulPart}`;
          }
          if (/^\d+\.\s+/.test(b)) {
            const items = b
              .split("\n")
              .map((line) => line.replace(/^\d+\.\s+/, "").trim())
              .filter(Boolean)
              .map((item) => `<li>${item}</li>`)
              .join("\n  ");
            return `<ol class="space-y-2 my-2.5">\n  ${items}\n</ol>`;
          }
          return `<p>${b}</p>`;
        }).join("\n\n");
        cols.push(`<div class="blog-split-col">\n${compiledCol}\n</div>`);
      }
      const html = `<div class="blog-split-container split-${ratio}">\n${cols.join("\n")}\n</div>`;
      return registerBlock(html);
    }
  );


  // Split remaining loose paragraphs into <p> tags if not wrapped in HTML tags
  const blocks = text.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
  const compiledBlocks = blocks.map((b) => {
    if (b.startsWith("__TECH_INFINIX_BLOCK_") || b.startsWith("<")) {
      return b;
    }
    // Markdown lists
    if (b.startsWith("- ") || b.startsWith("* ")) {
      const items = b
        .split("\n")
        .map((line) => line.replace(/^[-*]\s+/, "").trim())
        .filter(Boolean)
        .map((item) => `<li>${item}</li>`)
        .join("\n  ");
      return `<ul class="space-y-1.5 my-2.5">\n  ${items}\n</ul>`;
    }
    if (/\n\s*[-*]\s+/.test(b)) {
      const lines = b.split("\n");
      const textLines: string[] = [];
      const listItems: string[] = [];
      let inList = false;
      for (const line of lines) {
        if (/^[-*]\s+/.test(line.trim())) {
          inList = true;
          listItems.push(`<li>${line.trim().replace(/^[-*]\s+/, "")}</li>`);
        } else if (!inList) {
          textLines.push(line);
        } else {
          listItems.push(`<li>${line.trim()}</li>`);
        }
      }
      const pPart = textLines.length > 0 ? `<p>${textLines.join(" ").trim()}</p>\n\n` : "";
      const ulPart = `<ul class="space-y-1.5 my-2.5">\n  ${listItems.join("\n  ")}\n</ul>`;
      return `${pPart}${ulPart}`;
    }
    if (/^\d+\.\s+/.test(b)) {
      const items = b
        .split("\n")
        .map((line) => line.replace(/^\d+\.\s+/, "").trim())
        .filter(Boolean)
        .map((item) => `<li>${item}</li>`)
        .join("\n  ");
      return `<ol class="space-y-2 my-2.5">\n  ${items}\n</ol>`;
    }
    return `<p>${b}</p>`;
  });

  let finalCompiledHtml = compiledBlocks.join("\n\n");

  // Recursively unpack registered blocks so nested blocks resolve perfectly
  let safetyLimit = 6;
  while (finalCompiledHtml.includes("__TECH_INFINIX_BLOCK_") && safetyLimit-- > 0) {
    for (const [token, blockHtml] of blocksMap.entries()) {
      if (finalCompiledHtml.includes(token)) {
        finalCompiledHtml = finalCompiledHtml.split(token).join(blockHtml);
      }
    }
  }

  return {
    title,
    slug,
    category,
    readTime,
    author,
    summary,
    coverImage,
    coverImageAlt,
    includeContactForm,
    compiledHtml: finalCompiledHtml,
    rawContent: rawText,
    toc
  };
}

/**
 * Reverse Compiler: Converts stored HTML & metadata back into the clean tag syntax
 * so existing articles can be reopened on the blank canvas without losing tags!
 */
export function convertHtmlToTaggedText(blog: any): string {
  if (!blog) return "";

  let content = blog.content || "";

  // 1. Direct instant lossless retrieval if source comment exists
  const sourceMatch = content.match(/<!--\s*TECH_INFINIX_TAGGED_SOURCE_START\s*\n([\s\S]*?)\n\s*TECH_INFINIX_TAGGED_SOURCE_END\s*-->/);
  if (sourceMatch) {
    return sourceMatch[1].trim();
  }

  const lines: string[] = [];

  if (blog.title) lines.push(`[TITLE] ${blog.title} [/TITLE]`);
  if (blog.slug) lines.push(`[SLUG] ${blog.slug} [/SLUG]`);
  if (blog.category) lines.push(`[CATEGORY] ${blog.category} [/CATEGORY]`);
  if (blog.readTime || blog.read_time) lines.push(`[READ_TIME] ${blog.readTime || blog.read_time} [/READ_TIME]`);
  if (blog.author) lines.push(`[AUTHOR] ${blog.author} [/AUTHOR]`);
  if (blog.summary) lines.push(`[SUMMARY] ${blog.summary} [/SUMMARY]`);
  if (blog.cover_image) {
    lines.push(`[COVER_IMAGE src="${blog.cover_image}" alt="${blog.title || 'Cover'}" /]`);
  }
  lines.push(`[INCLUDE_FORM: ${blog.include_contact_form !== false}]`);
  lines.push("");

  // If content already has tags, return combined
  if (content.includes("[SECTION") || content.includes("[STAT_GRID") || content.includes("[TABLE]")) {
    return `${lines.join("\n")}\n${content}`;
  }

  // Reverse convert highlight box
  content = content.replace(
    /<div class="blog-highlight-box">[\s\S]*?<div class="blog-badge[^"]*">([\s\S]*?)<\/div>[\s\S]*?<p class="font-semibold[^"]*">([\s\S]*?)<\/p>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>[\s\S]*?<\/div>/gi,
    (m: string, badge: string, headline: string, body: string) =>
      `[HIGHLIGHT badge="${badge.trim()}"]\n[HEADLINE] ${headline.trim()} [/HEADLINE]\n${body.trim()}\n[/HIGHLIGHT]`
  );

  // Reverse convert headings
  content = content.replace(
    /<h2(?:\s+id=["']([^"']*)["'])?>([\s\S]*?)<\/h2>/gi,
    (m: string, id: string, title: string) => `[SECTION id="${id || slugify(title)}" title="${title.trim()}"]\n[/SECTION]`
  );

  content = content.replace(
    /<h3(?:\s+id=["']([^"']*)["'])?>([\s\S]*?)<\/h3>/gi,
    (m: string, id: string, title: string) => `[SUBSECTION title="${title.trim()}"]\n[/SUBSECTION]`
  );

  // Reverse convert images
  content = content.replace(
    /<div class="[^"]*blog-image-wrapper[^"]*"[^>]*data-layout=["']([^"']*)["'][^>]*>([\s\S]*?)<\/div>/gi,
    (m: string, layout: string, inner: string) => {
      const imgMatch = inner.match(/<img\s+src=["']([^"']+)["'](?:\s+alt=["']([^"']*)["'])?[^>]*>/i);
      if (!imgMatch) return m;
      const src = imgMatch[1];
      const alt = imgMatch[2] || "";
      const capMatch = inner.match(/<div class="[^"]*font-mono[^"]*">([\s\S]*?)<\/div>/i);
      const caption = capMatch ? capMatch[1].trim() : "";
      const textMatch = inner.match(/<p class="[^"]*text-secondary-custom[^"]*">([\s\S]*?)<\/p>/i);
      const text = textMatch ? textMatch[1].trim() : "";
      const headMatch = inner.match(/<h4 class="[^"]*font-semibold[^"]*">([\s\S]*?)<\/h4>/i);
      const headline = headMatch ? headMatch[1].trim() : "";

      const extraAttrs: string[] = [];
      if (alt) extraAttrs.push(`alt="${alt}"`);
      if (headline) extraAttrs.push(`headline="${headline}"`);
      if (text) extraAttrs.push(`text="${text}"`);
      if (caption) extraAttrs.push(`caption="${caption}"`);
      extraAttrs.push(`layout="${layout || 'full'}"`);

      return `[IMAGE src="${src}" ${extraAttrs.join(" ")} /]`;
    }
  );

  // Reverse convert split containers
  content = content.replace(
    /<div class="blog-split-container\s+split-([^"]*)">([\s\S]*?)<\/div>\s*<\/div>/gi,
    (m: string, ratio: string, inner: string) => {
      const colRegex = /<div class="blog-split-col[^"]*">([\s\S]*?)<\/div>/gi;
      const cols: string[] = [];
      let cMatch;
      while ((cMatch = colRegex.exec(inner)) !== null) {
        cols.push(`  [COL]\n  ${cMatch[1].trim()}\n  [/COL]`);
      }
      return `[SPLIT ratio="${ratio}"]\n${cols.join("\n")}\n[/SPLIT]`;
    }
  );

  // Reverse convert quote boxes
  content = content.replace(
    /<div class="blog-quote-box">[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>[\s\S]*?(?:<span[^>]*>—\s*([\s\S]*?)<\/span>)?[\s\S]*?<\/div>/gi,
    (m: string, text: string, author: string) =>
      `[QUOTE author="${author ? author.trim() : ''}"]\n${text.trim()}\n[/QUOTE]`
  );

  // Reverse convert tables
  content = content.replace(
    /<div class="blog-table-wrapper">[\s\S]*?<table class="blog-table">([\s\S]*?)<\/table>[\s\S]*?<\/div>/gi,
    (m: string, tableInner: string) => {
      const rows: string[][] = [];
      const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
      let trMatch;
      while ((trMatch = trRegex.exec(tableInner)) !== null) {
        const cellRegex = /<(?:th|td)[^>]*>([\s\S]*?)<\/(?:th|td)>/gi;
        const cells: string[] = [];
        let cellMatch;
        while ((cellMatch = cellRegex.exec(trMatch[1])) !== null) {
          cells.push(cellMatch[1].replace(/<[^>]+>/g, "").trim());
        }
        if (cells.length > 0) {
          rows.push(cells);
        }
      }

      if (rows.length === 0) return "";
      const tableLines: string[] = ["[TABLE]"];
      // Header row
      tableLines.push(`| ${rows[0].join(" | ")} |`);
      // Separator
      tableLines.push(`| ${rows[0].map(() => "---").join(" | ")} |`);
      // Body rows
      for (let i = 1; i < rows.length; i++) {
        tableLines.push(`| ${rows[i].join(" | ")} |`);
      }
      tableLines.push("[/TABLE]");
      return tableLines.join("\n");
    }
  );

  lines.push(content);
  return lines.join("\n");
}
