import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlFile = path.resolve(__dirname, '../temp_projects.html');
const outputBaseDir = path.resolve(__dirname, '../src/projects');

if (!fs.existsSync(outputBaseDir)) {
    fs.mkdirSync(outputBaseDir, { recursive: true });
}

const htmlContent = fs.readFileSync(htmlFile, 'utf8');

// 1. Extract Project Map: index -> Name
// Regex for: <a data-gallery-index="0" class="...">Sadeep Villa</a>
const projectMapRegex = /<a data-gallery-index="(\d+)"[^>]*>([^<]+)<\/a>/g;
const projectMap = {};
let match;

while ((match = projectMapRegex.exec(htmlContent)) !== null) {
    const index = match[1];
    const name = match[2].trim();
    projectMap[index] = name;
}

console.log('Found Projects:', projectMap);

// 2. Extract Images: index -> [url, url, ...]
// Regex for: <a ... data-e-gallery-tags="0" href="...">
const imageRegex = /<a[^>]+data-e-gallery-tags="(\d+)"[^>]+href="([^"]+)"/g;
const projectImages = {};

while ((match = imageRegex.exec(htmlContent)) !== null) {
    const index = match[1];
    const url = match[2];

    if (!projectImages[index]) {
        projectImages[index] = [];
    }
    projectImages[index].push(url);
}

// 3. Process each project
async function processProjects() {
    for (const [index, name] of Object.entries(projectMap)) {
        if (!projectImages[index]) {
            console.log(`No images found for project: ${name} (Index ${index})`);
            continue;
        }

        const safeName = name.replace(/[^a-zA-Z0-9 -]/g, '').trim();
        const projectDir = path.join(outputBaseDir, safeName);
        const imagesDir = path.join(projectDir, 'images');

        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
        }

        const images = [];
        console.log(`Processing ${name}...`);

        for (let i = 0; i < projectImages[index].length; i++) {
            const imgUrl = projectImages[index][i];
            const ext = path.extname(imgUrl).split('?')[0] || '.jpg';
            const filename = `image_${i + 1}${ext}`;
            const filePath = path.join(imagesDir, filename);

            try {
                await downloadImage(imgUrl, filePath);
                // Store relative path for frontend use
                images.push(`./images/${filename}`);
            } catch (err) {
                console.error(`Failed to download ${imgUrl}:`, err.message);
            }
        }

        const manifest = {
            id: index,
            title: name,
            description: `Interior design project by Yezda Interiors: ${name}`,
            images: images
        };

        fs.writeFileSync(path.join(projectDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
        console.log(`Saved manifest for ${name}`);
    }
}

function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Status Code: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
}

processProjects();
