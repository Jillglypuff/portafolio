import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pagesDir = path.resolve(__dirname, '../src/pages/[lang]');

const files = fs.readdirSync(pagesDir);

for (const file of files) {
  if (file.startsWith('blog-') && file.endsWith('.astro')) {
    const filePath = path.join(pagesDir, file);
    const slug = file.replace('.astro', '');
    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. Add import in frontmatter
    if (!content.includes('import CommentsSection')) {
      if (content.includes("import Animations from '../../components/Animations.vue';")) {
        content = content.replace(
          "import Animations from '../../components/Animations.vue';",
          "import Animations from '../../components/Animations.vue';\nimport CommentsSection from '../../components/CommentsSection.vue';"
        );
      } else if (content.includes("import Layout from '../../layouts/Layout.astro';")) {
        content = content.replace(
          "import Layout from '../../layouts/Layout.astro';",
          "import Layout from '../../layouts/Layout.astro';\nimport CommentsSection from '../../components/CommentsSection.vue';"
        );
      }
    }

    // 2. Insert CommentsSection inside post-content container right before closing article
    if (!content.includes('<CommentsSection')) {
      // Regex matches </div> followed by whitespace and </article>
      content = content.replace(
        /<\/div>\s*<\/article>/,
        `  <!-- Comments Section -->\n          <CommentsSection slug="${slug}" lang={lang} client:load />\n        </div>\n      </article>`
      );
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file} for slug: ${slug}`);
  }
}

console.log('Finished updating all blog files perfectly.');
