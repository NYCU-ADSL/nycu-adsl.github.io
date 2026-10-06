#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Wen-Chih Peng's dblp person id. The author record lists exactly this
// person's publications, so no name-search ambiguity and no search backend.
const DBLP_PID = '92/1623';
const DBLP_URL = `https://dblp.org/pid/${DBLP_PID}.xml`;

const USER_AGENT = 'nycu-adsl-site/1.0';
const REQUEST_TIMEOUT_MS = 60_000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// dblp sits behind Anubis (https://github.com/TecharoHQ/anubis). For plain
// clients it serves a "metarefresh" challenge: keep the cookie it sets, wait
// the number of seconds given in a "Refresh" header or a
// <meta http-equiv="refresh"> tag, then follow the pass-challenge URL. That
// sets an auth cookie and redirects back to the original URL. This is exactly
// what a browser does with JavaScript disabled.
async function fetchThroughAnubis(url, { maxAttempts = 8 } = {}) {
  const cookies = new Map();
  const cookieHeader = () =>
    Array.from(cookies.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
  const rememberCookies = (res) => {
    const setCookies = typeof res.headers.getSetCookie === 'function'
      ? res.headers.getSetCookie()
      : [res.headers.get('set-cookie')].filter(Boolean);
    for (const line of setCookies) {
      const [pair, ...attrs] = line.split(';');
      const eq = pair.indexOf('=');
      if (eq < 0) continue;
      const name = pair.slice(0, eq).trim();
      const value = pair.slice(eq + 1).trim();
      const expired = attrs.some((a) => /^\s*max-age=0\s*$/i.test(a));
      if (expired || value === '') cookies.delete(name);
      else cookies.set(name, value);
    }
  };
  const get = async (target) => {
    const res = await fetch(target, {
      redirect: 'manual',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/xml', Cookie: cookieHeader() }
    });
    rememberCookies(res);
    return res;
  };

  let target = url;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await get(target);

    if ([301, 302, 303, 307, 308].includes(res.status)) {
      target = new URL(res.headers.get('location') || url, target).toString();
      continue;
    }
    if (res.status === 429) {
      const wait = Number(res.headers.get('retry-after')) || 10;
      console.warn(`dblp rate limit hit, waiting ${wait}s before retrying...`);
      await sleep(wait * 1000);
      continue;
    }
    if (!res.ok) {
      const snippet = (await res.text()).replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 300);
      throw new Error(`HTTP ${res.status} from ${target}\n${snippet}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return res;

    const html = await res.text();
    if (!/Making sure you.{0,10}re not a bot/i.test(html) && !html.includes('anubis_challenge')) {
      throw new Error(`Expected XML from dblp but got HTML (${contentType})`);
    }

    // Anubis randomly puts the refresh directive either in a "Refresh" HTTP
    // header or in a <meta http-equiv="refresh"> tag; browsers honour both.
    const refreshRe = /^\s*(\d+)\s*;\s*url=(.+?)\s*$/i;
    const headerRefresh = (res.headers.get('refresh') || '').match(refreshRe);
    const metaRefresh = html.match(/<meta\s+http-equiv="refresh"\s+content="(\d+)\s*;\s*url=([^"]+)"/i);
    const refresh = headerRefresh || metaRefresh;
    if (!refresh) {
      console.warn(`dblp bot check (attempt ${attempt}): no refresh directive found, retrying...`);
      await sleep(3000);
      target = url;
      continue;
    }
    const delaySec = Number(refresh[1]) || 2;
    const passUrl = new URL(refresh[2].replace(/&amp;/g, '&'), target).toString();
    console.warn(`dblp bot check (attempt ${attempt}): waiting ${delaySec}s then passing challenge...`);
    await sleep(delaySec * 1000 + 500);
    target = passUrl;
  }
  throw new Error('Could not get past the dblp bot check (Anubis) after several attempts');
}

// --- Minimal parsing of the dblp person XML (no dependencies needed) -------

const decodeEntities = (s) =>
  String(s)
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

// Text of the first <tag> child; inline markup (e.g. <i>) is stripped.
const textOf = (xml, tag) => {
  const m = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`));
  return m ? decodeEntities(m[1].replace(/<[^>]+>/g, '')).trim() : '';
};
const allTextOf = (xml, tag) => {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'g');
  return Array.from(xml.matchAll(re), (m) => decodeEntities(m[1].replace(/<[^>]+>/g, '')).trim());
};
const attrOf = (openTag, name) => {
  const m = openTag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? decodeEntities(m[1]) : '';
};

function parseDblpRecords(xml) {
  // Each publication is wrapped in <r>...</r>; editorships (<proceedings>)
  // are not papers, so skip them.
  const records = [];
  for (const m of xml.matchAll(/<r>\s*<(article|inproceedings|incollection|book|phdthesis|mastersthesis|www)(\s[^>]*)?>([\s\S]*?)<\/\1>\s*<\/r>/g)) {
    const [, kind, attrs = '', body] = m;
    const openTag = `<${kind}${attrs}>`;
    const publtype = attrOf(openTag, 'publtype');
    const authors = allTextOf(body, 'author');
    if (!authors.length) continue;

    let type = 'Other';
    if (kind === 'inproceedings') type = 'Conference';
    else if (kind === 'article' && publtype !== 'informal') type = 'Journal';

    records.push({
      key: attrOf(openTag, 'key'),
      type,
      title: textOf(body, 'title'),
      authors,
      year: Number(textOf(body, 'year')) || undefined,
      // Drop volume-part qualifiers like "PAKDD (3)" but keep "EMNLP (Findings)".
      venue: (textOf(body, 'journal') || textOf(body, 'booktitle') || '').replace(/\s*\(\d+\)$/, ''),
      ee: allTextOf(body, 'ee')[0] || '',
      doi: (allTextOf(body, 'ee').find((u) => /doi\.org\//.test(u)) || '').replace(/^.*doi\.org\//, '')
    });
  }
  return records;
}

async function main() {
  const outDir = path.resolve(__dirname, '../public/data');
  const outFile = path.join(outDir, 'publications.json');

  try {
    const res = await fetchThroughAnubis(DBLP_URL);
    const xml = await res.text();
    if (!xml.includes('<dblpperson')) throw new Error('Unexpected response from dblp (no <dblpperson> root)');

    const records = parseDblpRecords(xml);
    if (!records.length) throw new Error('No publications parsed from dblp response');

    const entries = records.map((r) => {
      const yearNum = r.year || new Date().getFullYear();
      const key = String(r.key || '').replace(/[\\/]/g, '_') || `entry_${yearNum}`;
      const doiUrl = r.doi ? `https://doi.org/${r.doi}` : undefined;
      const link = r.ee || doiUrl || '#';
      const isJournal = r.type === 'Journal';
      const bibtexType = isJournal ? 'article' : 'inproceedings';
      const bibVenueKey = isJournal ? 'journal' : 'booktitle';

      const bibtex = `@${bibtexType}{${key},\n  title={${r.title}},\n  author={${r.authors.join(' and ')}},\n  year={${yearNum}},\n  ${bibVenueKey}={${r.venue}}\n}`;

      return {
        title: r.title || 'Untitled',
        authors: r.authors,
        venue: r.venue,
        type: r.type,
        abstract: '',
        pdf: link,
        code: '',
        bibtex,
        year: yearNum
      };
    });

    // Group by year and sort
    const yearToPapers = new Map();
    for (const e of entries) {
      const y = Number(e.year) || new Date().getFullYear();
      const arr = yearToPapers.get(y) || [];
      arr.push(e);
      yearToPapers.set(y, arr);
    }

    const typeRank = (t) => (t === 'Journal' ? 0 : t === 'Conference' ? 1 : 2);
    const grouped = Array.from(yearToPapers.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([year, papers]) => ({
        year,
        papers: papers.slice().sort((p1, p2) => typeRank(p1.type) - typeRank(p2.type))
      }));

    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(outFile, JSON.stringify({ updatedAt: new Date().toISOString(), groups: grouped }, null, 2));
    console.log(`Wrote ${outFile} (${entries.length} publications)`);
  } catch (err) {
    console.error('Failed to fetch publications:', err?.message || err);
    process.exitCode = 1;
  }
}

main();
