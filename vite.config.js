import { defineConfig } from 'vite';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const MANIFEST_PLACEHOLDER = '__MANIFEST_URL__';
const SW_PLACEHOLDER = '__SW_URL__';
const ICON_192_PLACEHOLDER = '__ICON_192_URL__';

const PRECACHE_PLACEHOLDER = '__PRECACHE_URLS__';

function* walkFiles(dir) {
    const entries = readdirSync(dir);
    for (const entry of entries) {
        const fullPath = resolve(dir, entry);
        const st = statSync(fullPath);
        if (st.isDirectory()) {
            yield* walkFiles(fullPath);
        } else if (st.isFile()) {
            yield fullPath;
        }
    }
}

function cacheBustingEntrypointsPlugin() {
    let isBuild = false;
    let viteRootDir = process.cwd();

    return {
        name: 'missile-fleet-cache-busting-entrypoints',
        enforce: 'post',
        configResolved(config) {
            isBuild = config.command === 'build';
            viteRootDir = config.root; // <- important when moving source under src/
        },
        transformIndexHtml(html) {
            // In dev, keep things simple: serve the source files.
            // Service worker registration is gated behind import.meta.env.PROD in index.html.
            if (!isBuild) {
                return html
                    .replaceAll(MANIFEST_PLACEHOLDER, './manifest.json')
                    .replaceAll(SW_PLACEHOLDER, './sw.js')
                    .replaceAll(ICON_192_PLACEHOLDER, './icons/icon-192.png');
            }
            return html;
        },
        generateBundle(_options, bundle) {
            const rootDir = viteRootDir;

            const emitHashedAsset = (relPath) => {
                const absPath = resolve(rootDir, relPath);
                const source = readFileSync(absPath);
                const hash = createHash('sha256').update(source).digest('hex').slice(0, 12);
                const fileName = relPath.split('/').pop();
                const dot = fileName.lastIndexOf('.');
                const base = dot === -1 ? fileName : fileName.slice(0, dot);
                const ext = dot === -1 ? '' : fileName.slice(dot);
                const outFile = `assets/${base}-${hash}${ext}`;
                this.emitFile({ type: 'asset', fileName: outFile, source });
                return { url: `./${outFile}`, outFile };
            };

            // Emit icons + screenshots with hashed filenames (shared across index, manifest, sw).
            const pwaAssets = {
                'icons/icon-192.png': emitHashedAsset('icons/icon-192.png'),
                'icons/icon-512.png': emitHashedAsset('icons/icon-512.png'),
                'screenshots/desktop_1.jpg': emitHashedAsset('screenshots/desktop_1.jpg'),
                'screenshots/mobile_1.jpg': emitHashedAsset('screenshots/mobile_1.jpg'),
            };

            // Emit a stable manifest.json at the site root, but rewrite its image URLs to hashed outputs.
            const manifestFileName = 'manifest.json';
            const manifestObj = JSON.parse(readFileSync(resolve(rootDir, 'manifest.json'), 'utf8'));
            if (Array.isArray(manifestObj.icons)) {
                manifestObj.icons = manifestObj.icons.map((icon) => {
                    const src = String(icon.src || '');
                    const key = src.replace(/^\.\//, '');
                    if (pwaAssets[key]) {
                        return { ...icon, src: pwaAssets[key].url };
                    }
                    return icon;
                });
            }
            if (Array.isArray(manifestObj.screenshots)) {
                manifestObj.screenshots = manifestObj.screenshots.map((shot) => {
                    const src = String(shot.src || '');
                    const key = src.replace(/^\.\//, '');
                    if (pwaAssets[key]) {
                        return { ...shot, src: pwaAssets[key].url };
                    }
                    return shot;
                });
            }

            const emittedManifest = JSON.stringify(manifestObj, null, 2) + '\n';

            this.emitFile({
                type: 'asset',
                fileName: manifestFileName,
                source: emittedManifest,
            });

            // Find the built service worker chunk file name.
            const swChunk = Object.values(bundle).find((item) => {
                return (
                    item.type === 'chunk' &&
                    (item.name === 'sw' || (item.facadeModuleId && item.facadeModuleId.endsWith('/sw.js')))
                );
            });

            if (!swChunk || swChunk.type !== 'chunk') {
                this.error('Could not find service worker output chunk for sw.js');
            }

            const swFileName = swChunk.fileName;

            // Vite may lift inline <script type="module"> content into an external chunk.
            // Replace SW placeholders in all generated chunks so registration uses the hashed filename.
            for (const item of Object.values(bundle)) {
                if (item.type === 'chunk' && item.code.includes(SW_PLACEHOLDER)) {
                    item.code = item.code.replaceAll(SW_PLACEHOLDER, `./${swFileName}`);
                }
            }

            // Build a precache list from the actual output bundle, plus manifest URL w/ cache-busting query.
            const precache = new Set();
            precache.add('./');
            precache.add('./index.html');
            precache.add(`./${manifestFileName}`);
            precache.add(`./${swFileName}`);

            for (const item of Object.values(bundle)) {
                if (item.type === 'chunk') {
                    precache.add(`./${item.fileName}`);
                } else if (item.type === 'asset') {
                    // Include css + emitted hashed images.
                    if (item.fileName.startsWith('assets/')) {
                        precache.add(`./${item.fileName}`);
                    }
                }
            }

            const precacheArray = Array.from(precache);
            const swWithPrecache = swChunk.code.replaceAll(PRECACHE_PLACEHOLDER, JSON.stringify(precacheArray));
            const buildHash = createHash('sha256').update(swWithPrecache).digest('hex').slice(0, 12);
            swChunk.code = swWithPrecache.replaceAll('__BUILD_HASH__', buildHash);

            // Rewrite the generated HTML to point at hashed manifest + SW.
            const htmlAsset = Object.values(bundle).find((item) => {
                if (item.type !== 'asset') return false;
                if (!item.fileName.endsWith('.html')) return false;
                const src = String(item.source);
                return src.includes(MANIFEST_PLACEHOLDER) || src.includes(SW_PLACEHOLDER);
            });

            if (!htmlAsset || htmlAsset.type !== 'asset') {
                this.error('Could not find HTML output containing placeholders');
            }

            const html = String(htmlAsset.source);
            htmlAsset.source = html
                .replaceAll(MANIFEST_PLACEHOLDER, `./${manifestFileName}`)
                .replaceAll(SW_PLACEHOLDER, `./${swFileName}`);

            // Rewrite icon placeholders to hashed icon URLs.
            htmlAsset.source = String(htmlAsset.source).replaceAll(
                ICON_192_PLACEHOLDER,
                pwaAssets['icons/icon-192.png'].url
            );
        },
    };
}

export default defineConfig(() => ({
    root: 'src',
    base: './',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(process.cwd(), 'src/index.html'),
                sw: resolve(process.cwd(), 'src/sw.js'),
            },
            output: {
                // Keep service worker at the site root so it can control the whole app.
                entryFileNames: (chunk) => (chunk.name === 'sw' ? 'sw.js' : 'assets/[name]-[hash].js'),
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash][extname]',
            },
        },
    },
    plugins: [cacheBustingEntrypointsPlugin()],
}));
