import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import the patch data
import { patchCategories } from './src/patchesData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, 'public', 'patches', filename);
    const file = fs.createWriteStream(filePath);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

async function downloadAllImages() {
  const downloadPromises = [];

  Object.values(patchCategories).forEach(category => {
    category.patches.forEach(patch => {
      if (patch.image) {
        // Create a safe filename from the patch name
        const filename = patch.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '') + '.jpg';

        downloadPromises.push(
          downloadImage(patch.image, filename)
            .catch(err => console.error(`Error downloading ${patch.name}:`, err))
        );
      }
    });
  });

  await Promise.all(downloadPromises);
  console.log('All downloads completed!');
}

// Run the download
downloadAllImages().catch(console.error);