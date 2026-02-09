import './style.css';

// 1. Gather all manifest.json files and images
const manifestModules = import.meta.glob('/src/projects/*/manifest.json', { eager: true });
const imageModules = import.meta.glob('/src/projects/*/images/*.{jpg,jpeg,png}', { eager: true, as: 'url' });

/* 
 * Helper to get the full URL of an image from the relative path in manifest.json.
 */
function resolveImageUrl(projectDirName, relativePath) {
    const fullPath = `/src/projects/${projectDirName}/${relativePath.replace(/^\.\//, '')}`;
    return imageModules[fullPath] || null;
}

// 2. Parse Projects
const projects = [];

for (const path in manifestModules) {
    const manifest = manifestModules[path];
    const pathParts = path.split('/');
    const folderName = pathParts[pathParts.length - 2];

    const projectImages = manifest.images.map(imgRelPath => resolveImageUrl(folderName, imgRelPath)).filter(Boolean);

    if (projectImages.length > 0) {
        projects.push({
            ...manifest,
            folderName,
            fullImages: projectImages, // Array of resolved URLs
            coverImage: projectImages[0]
        });
    }
}

// Sort by ID
projects.sort((a, b) => parseInt(a.id) - parseInt(b.id));

// 3. Render Grid (Main Page)
const container = document.getElementById('projects-container');

if (container) {
    container.innerHTML = projects.map((p, index) => `
    <div class="gallery-item" data-id="${index}">
      <img src="${p.coverImage}" alt="${p.title}" loading="lazy">
      <div class="overlay">
        <h3>${p.title}</h3>
        <p>View Project Gallery</p>
      </div>
    </div>
  `).join('');

    // Add Click Listeners
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.id);
            openProjectDetails(index);
        });
    });
}

// 4. Project Details Overlay Logic
let currentProjectIndex = 0;

function openProjectDetails(index) {
    currentProjectIndex = index;
    const project = projects[index];

    // Inject Overlay HTML if not exists
    let overlay = document.getElementById('project-detail-overlay');
    if (!overlay) {
        const overlayHTML = `
            <div id="project-detail-overlay" class="project-detail-overlay">
                <button class="detail-close-btn">&times;</button>
                <div class="detail-header">
                    <h2 id="detail-title"></h2>
                    <p id="detail-desc"></p>
                </div>
                <div id="detail-grid" class="project-images-grid">
                    <!-- Images injected here -->
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', overlayHTML);
        overlay = document.getElementById('project-detail-overlay');

        // Bind Close Event
        overlay.querySelector('.detail-close-btn').addEventListener('click', closeProjectDetails);
    }

    // Populate Data
    document.getElementById('detail-title').textContent = project.title;
    document.getElementById('detail-desc').textContent = project.description;

    const grid = document.getElementById('detail-grid');
    grid.innerHTML = project.fullImages.map((imgUrl, i) => `
        <div class="grid-image-item" data-index="${i}">
            <img src="${imgUrl}" alt="${project.title} - Image ${i + 1}" loading="lazy">
        </div>
    `).join('');

    // Add Grid Click Listeners for Zoom/Lightbox
    grid.querySelectorAll('.grid-image-item').forEach(item => {
        item.addEventListener('click', () => {
            const imgIndex = parseInt(item.dataset.index);
            openLightbox(currentProjectIndex, imgIndex);
        });
    });

    // Show Overlay
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProjectDetails() {
    const overlay = document.getElementById('project-detail-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}


// 5. Lightbox Logic (Zoom View)
let currentImageIndex = 0;

function openLightbox(projectNum, imageNum) {
    currentProjectIndex = projectNum; // Should align with detail view
    currentImageIndex = imageNum;
    updateLightbox();

    // Create lightbox if needed (it might handle global events)
    initLightbox();

    document.getElementById('lightbox').classList.add('active');
    // document.body.style.overflow is already hidden from overlay
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    // Do NOT re-enable scroll, as we are still in overlay
}

function updateLightbox() {
    const project = projects[currentProjectIndex];
    const imgUrl = project.fullImages[currentImageIndex]; // Using project images

    const imgEl = document.getElementById('lightbox-img');
    const captionEl = document.getElementById('lightbox-caption');

    imgEl.src = imgUrl;
    captionEl.textContent = `${project.title} (${currentImageIndex + 1} / ${project.fullImages.length})`;
}

function prevImage() {
    const project = projects[currentProjectIndex];
    if (currentImageIndex > 0) {
        currentImageIndex--;
    } else {
        currentImageIndex = project.fullImages.length - 1;
    }
    updateLightbox();
}

function nextImage() {
    const project = projects[currentProjectIndex];
    if (currentImageIndex < project.fullImages.length - 1) {
        currentImageIndex++;
    } else {
        currentImageIndex = 0;
    }
    updateLightbox();
}

function initLightbox() {
    if (document.getElementById('lightbox')) return;

    const lightboxHTML = `
        <div id="lightbox" class="lightbox">
            <button class="lightbox-close">&times;</button>
            <button class="lightbox-prev">&#10094;</button>
            <div class="lightbox-content">
                <img id="lightbox-img" class="lightbox-img" src="" alt="Project Image">
                <p id="lightbox-caption" class="lightbox-caption"></p>
            </div>
            <button class="lightbox-next">&#10095;</button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);

    // Bind Events
    document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    document.querySelector('.lightbox-prev').addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });
    document.querySelector('.lightbox-next').addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });

    document.getElementById('lightbox').addEventListener('click', (e) => {
        if (e.target.id === 'lightbox') closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (!document.getElementById('lightbox') || !document.getElementById('lightbox').classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'ArrowRight') nextImage();
    });
}
