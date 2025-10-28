# NYCU ADSL Lab Website

This is the official website for the Advanced Database System Laboratory (ADSL) at National Yang Ming Chiao Tung University (NYCU).

## Features

- **Modern Design**: Built with Astro and Tailwind CSS for a clean, responsive experience
- **Fast Performance**: Static site generation for optimal loading speeds
- **Mobile Friendly**: Responsive design that works on all devices
- **Content Collections**: Structured content management using Astro Content Collections
- **Auto-sync Publications**: Automatic fetching of publications from DBLP API

## Pages

- **Home**: Lab overview and highlights
- **News**: Latest updates and announcements with tag filtering
- **Research**: Research areas and featured projects
- **Teaching**: Course offerings and educational resources
- **Publications**: Academic papers and research outputs (auto-synced from DBLP)
- **Members**: Current members and alumni (PhD, Master, Research Assistants)
- **Album**: Lab activities and event photos

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and visit `http://localhost:4321`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production (includes type checking)
- `npm run preview` - Preview production build locally
- `npm run fetch:publications` - Manually fetch publications from DBLP API

### Building for Production

```bash
npm run build
```

The static files will be generated in the `dist/` directory.

## Project Structure

```
/
├── public/                    # Static assets
│   ├── data/                  # Publications cache
│   ├── images/                # Public images
│   └── logo.svg
├── src/
│   ├── components/            # Reusable Astro components
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── NewsSummaryCard.astro
│   │   ├── NewsDetailCard.astro
│   │   └── AlbumCard.astro
│   ├── content/               # Content Collections
│   │   ├── config.ts          # Content schemas
│   │   ├── news/              # News articles (YYYY-MM-DD/index.md)
│   │   ├── research/          # Research projects
│   │   ├── member/            # Lab members
│   │   │   ├── current/       # Current members
│   │   │   └── alumni/        # Alumni
│   │   └── album/             # Photo albums
│   ├── layouts/               # Page layouts
│   │   └── BaseLayout.astro
│   └── pages/                 # Page routes
│       ├── index.astro        # Home page
│       ├── news.astro
│       ├── publications.astro
│       └── ...
├── scripts/
│   └── fetch-publications.mjs # DBLP API fetcher
└── .github/workflows/
    └── deploy.yml             # GitHub Actions deployment
```

## Content Management

### Adding News

1. Create a new directory under `src/content/news/` with format `YYYY-MM-DD/`
2. Add an `index.md` file with frontmatter:

```markdown
---
title: "新聞標題"
date: "2025-10-28"
tag: "Event"  # 可選標籤: Publication, Event 等
summary: "簡短摘要"
---

新聞詳細內容...
```

3. Images can be placed in the same directory and referenced with relative paths: `./image.jpg`

### Adding Members

1. Navigate to appropriate directory:
   - Current: `src/content/member/current/{phd|master|research-assistant}/YEAR/`
   - Alumni: `src/content/member/alumni/{phd|master}/YEAR/`

2. Create a member directory with their name (lowercase, hyphenated)

3. Add `index.md` with frontmatter:

```markdown
---
englishName: "John Doe"
chineseName: "約翰·多伊"
research: ["Machine Learning", "Data Mining"]
photo: ./photo.jpg  # Optional
email: "john@example.com"  # Optional
github: "https://github.com/johndoe"  # Optional
linkedin: "https://linkedin.com/in/johndoe"  # Optional
personalWebsite: "https://johndoe.com"  # Optional
thesisTitle: "論文標題"  # For alumni
thesis: "thesis.pdf"  # For alumni (place PDF in same directory)
entryYear: 2024
---

個人簡介...
```

### Adding Research Projects

1. Create a new `.md` file under `src/content/research/`
2. Add frontmatter:

```markdown
---
title: "研究計畫名稱"
startDate: "2024-01-01"
endDate: "Now"  # or "2025-12-31"
partner: "合作單位"
moreInfoUrl: "https://example.com"  # Optional
---

研究計畫詳細說明...
```

### Adding Album Photos

1. Create a new directory under `src/content/album/` with format `YYYY-MM-DD/`
2. Add `index.md` with frontmatter:

```markdown
---
title: "活動名稱"
date: "2025-10-28"
description: "活動描述"  # Optional
image: ./photo.jpg
---
```

3. Place the main photo in the same directory

## Deployment

### Automatic Deployment

The site automatically deploys to GitHub Pages when:
- **Push to main branch**: Triggers immediate deployment
- **Every 7 days**: Scheduled at 03:00 UTC to refresh publications
- **Manual trigger**: Can be triggered manually via GitHub Actions UI

### Deployment Process

1. **Checkout repository**
2. **Fetch Publications**: Runs `npm run fetch:publications` to update publications cache from DBLP API
3. **Build**: Compiles Astro site with type checking
4. **Deploy**: Publishes to GitHub Pages

The publications cache is stored at `public/data/publications.json` and is automatically refreshed during each deployment.

### Manual Deployment

You can manually trigger deployment from:
- GitHub → Actions → "Deploy to GitHub Pages" → Run workflow

## Technology Stack

- **Framework**: Astro 5.x
- **Styling**: Tailwind CSS 3.x with Typography plugin
- **Language**: TypeScript
- **Content**: Astro Content Collections
- **Performance**: Partytown (for third-party script optimization)
- **Data Source**: DBLP API (for publications)
- **Deployment**: GitHub Pages
- **CI/CD**: GitHub Actions

## Contributing

To add new content or make changes:

1. Follow the Content Management guidelines above
2. Test locally with `npm run dev`
3. Commit and push changes to main branch
4. Changes will automatically deploy to GitHub Pages

## License

MIT License - see LICENSE file for details.