#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const apiUrl = 'https://dblp.org/search/publ/api?q=Wen-Chih%20Peng&format=json&h=1000';
  const outDir = path.resolve(__dirname, '../public/data');
  const outFile = path.join(outDir, 'publications.json');

  try {
    const res = await fetch(apiUrl, { headers: { 'User-Agent': 'nycu-adsl-site/1.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const dblp = await res.json();
    const hits = Array.isArray(dblp?.result?.hits?.hit) ? dblp.result.hits.hit : [];
    const targetPid = '92/1623';

    const hasTargetPid = (authorsObj) => {
      const a = authorsObj?.author;
      if (!a) return false;
      const arr = Array.isArray(a) ? a : [a];
      return arr.some((x) => {
        if (x && typeof x === 'object') {
          const pid = x['@pid'] ?? x.pid;
          return pid === targetPid;
        }
        return false;
      });
    };

    const filteredHits = hits.filter((h) => hasTargetPid(h?.info?.authors));

    const normalizeType = (t) => {
      if (!t) return 'Other';
      const s = String(t).toLowerCase();
      if (s.includes('journal')) return 'Journal';
      if (s.includes('conference')) return 'Conference';
      return 'Other';
    };

    const parseAuthors = (authorsObj) => {
      const a = authorsObj?.author;
      if (!a) return [];
      if (Array.isArray(a)) return a.map((x) => x?.text ?? String(x));
      return [a?.text ?? String(a)];
    };

    const entries = filteredHits.map((h) => h.info).map((info) => {
      const yearNum = Number(info?.year) || new Date().getFullYear();
      const authors = parseAuthors(info?.authors);
      const type = normalizeType(info?.type);
      const key = String(info?.key || '').replace(/[\\/]/g, '_') || `entry_${yearNum}`;
      const doiUrl = info?.doi ? `https://doi.org/${info.doi}` : undefined;
      const eeUrl = typeof info?.ee === 'string' ? info.ee : undefined;
      const link = eeUrl || doiUrl || '#';
      const venue = info?.venue || info?.journal || '';
      const isJournal = type === 'Journal';
      const bibtexType = isJournal ? 'article' : 'inproceedings';
      const bibVenueKey = isJournal ? 'journal' : 'booktitle';

      const bibtex = `@${bibtexType}{${key},\n  title={${info?.title || ''}},\n  author={${authors.join(' and ')}},\n  year={${yearNum}},\n  ${bibVenueKey}={${venue}}\n}`;

      return {
        title: info?.title || 'Untitled',
        authors,
        venue,
        type,
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
    console.log(`Wrote ${outFile}`);
  } catch (err) {
    console.error('Failed to fetch publications:', err?.message || err);
    process.exitCode = 1;
  }
}

main();

