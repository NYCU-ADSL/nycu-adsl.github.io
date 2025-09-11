# NYCU ADSL Lab Website

This is the official website for the Advanced Deep Learning and Systems Laboratory (ADSL) at National Yang Ming Chiao Tung University (NYCU).

## Features

- **Modern Design**: Built with Astro and Tailwind CSS for a clean, responsive experience
- **Fast Performance**: Static site generation for optimal loading speeds
- **Mobile Friendly**: Responsive design that works on all devices
- **Easy to Update**: Simple content management through Astro pages

## Pages

- **Home**: Lab overview and highlights
- **News**: Latest updates and announcements
- **Research**: Research areas and featured projects
- **Teaching**: Course offerings and educational resources
- **Publications**: Academic papers and research outputs
- **Members**: Faculty, students, and lab team

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

3. Open your browser and visit `http://localhost:4321/website`

### Building for Production

```bash
npm run build
```

The static files will be generated in the `dist/` directory.

### Deployment

This site is configured to deploy automatically to GitHub Pages when changes are pushed to the main branch. The deployment is handled by GitHub Actions.

## Technology Stack

- **Framework**: Astro 5.x
- **Styling**: Tailwind CSS 3.x
- **Language**: TypeScript
- **Deployment**: GitHub Pages
- **CI/CD**: GitHub Actions

## Contributing

To add new content or make changes:

1. Edit the relevant `.astro` files in the `src/pages/` directory
2. Update content as needed
3. Test locally with `npm run dev`
4. Commit and push changes

Changes will automatically deploy to GitHub Pages.

## License

MIT License - see LICENSE file for details.