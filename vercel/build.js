// ============================================================
// FILE: vercel/build.js
// Vercel deployment adapter for OCR Test Data Generator.
// ============================================================

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const CSS = path.join(ROOT, "css", "style.css");
const INDEX = path.join(ROOT, "index.html");
const TEMPLATE = path.join(ROOT, "templates", "individual", "id");
const SAMPLE = path.join(ROOT, "sample");
const PHOTOS = path.join(ROOT, "BulkUpload_photos");

const JS_FILES = [
    "js/documents.js",
    "js/image-export.js",
    "js/individual/data-generator.js",
    "js/individual/document-renderer.js",
    "js/individual/app.js",
    "js/entity/data-generator.js",
    "js/entity/document-renderer.js",
    "js/entity/app.js"
];

const PHOTO_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif"
};

function read(file) {
    if (!fs.existsSync(file)) {
        throw new Error(`Required file not found: ${file}`);
    }

    return fs.readFileSync(file, "utf8");
}

function base64(file) {
    if (!fs.existsSync(file)) {
        throw new Error(`Required file not found: ${file}`);
    }

    return fs.readFileSync(file).toString("base64");
}

function dataUrl(file, type) {
    return `data:${type};base64,${base64(file)}`;
}

function cleanDist() {
    fs.rmSync(DIST, {
        recursive: true,
        force: true
    });

    fs.mkdirSync(DIST, {
        recursive: true
    });
}

function loadBulkPhotos() {
    const result = {};

    if (!fs.existsSync(PHOTOS)) {
        return result;
    }

    for (const name of fs.readdirSync(PHOTOS)) {
        const file = path.join(PHOTOS, name);

        if (!fs.statSync(file).isFile()) {
            continue;
        }

        const type =
            PHOTO_TYPES[
                path.extname(name).toLowerCase()
            ];

        if (type) {
            result[name] = dataUrl(file, type);
        }
    }

    return result;
}

function loadJavaScript() {
    return JS_FILES
        .map(file => {
            let source = read(
                path.join(ROOT, file)
            );

            // Vercel cannot serve local template paths from
            // inside the generated single-file application.
            if (
                file ===
                "js/entity/document-renderer.js"
            ) {
                source = source.replace(
                    /["']templates\/individual\/id\/PAN_Template\.png["']/g,
                    "window.PAN_TEMPLATE_BASE64"
                );
            }

            return `
// VERCEL BUILD: ${file}
${source}
`;
        })
        .join("\n");
}

function removeLocalAssets(html) {
    html = html.replace(
        /<link\s+[^>]*href=["'](?:\.\/)?css\/style\.css["'][^>]*>/gi,
        ""
    );

    for (const file of JS_FILES) {
        const escaped = file.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        html = html.replace(
            new RegExp(
                `<script\\s+[^>]*src=["'](?:\\.\\/)?${escaped}["'][^>]*>\\s*<\\/script>`,
                "gi"
            ),
            ""
        );
    }

    return html;
}

function createDeploymentHtml() {
    let html = read(INDEX);
    const css = read(CSS);

    const panTemplate = dataUrl(
        path.join(
            TEMPLATE,
            "PAN_Template.png"
        ),
        "image/png"
    );

    const aadhaarTemplate = dataUrl(
        path.join(
            TEMPLATE,
            "AADHAR_Template.png"
        ),
        "image/png"
    );

    const excelTemplate = base64(
        path.join(
            SAMPLE,
            "ocr-test-data-template.xlsx"
        )
    );

    const bulkPhotos = loadBulkPhotos();

    html = removeLocalAssets(html);

    html = html.replace(
        /<\/head>/i,
        `<style>
${css}
</style>
</head>`
    );

    const runtime = `
<script>
window.PAN_TEMPLATE_BASE64 =
    ${JSON.stringify(panTemplate)};

window.AADHAAR_TEMPLATE_BASE64 =
    ${JSON.stringify(aadhaarTemplate)};

window.OCR_TEMPLATE_BASE64 =
    ${JSON.stringify(excelTemplate)};

window.BULK_PHOTOS =
    ${JSON.stringify(bulkPhotos)};

window.BULK_PHOTO_COUNT =
    ${Object.keys(bulkPhotos).length};
</script>
`;

    const javascript = `
<script>
${loadJavaScript()}
</script>
`;

    return html.replace(
        /<\/body>/i,
        `${runtime}
${javascript}
</body>`
    );
}

function build() {
    console.log(
        "============================================================"
    );

    console.log(
        "OCR TEST DATA GENERATOR - VERCEL BUILD"
    );

    console.log(
        "============================================================"
    );

    cleanDist();

    const output = path.join(
        DIST,
        "index.html"
    );

    fs.writeFileSync(
        output,
        createDeploymentHtml(),
        "utf8"
    );

    const photoCount =
        Object.keys(
            loadBulkPhotos()
        ).length;

    console.log("✓ Generated dist/index.html");
    console.log("✓ PAN template loaded");
    console.log("✓ Aadhaar template loaded");
    console.log("✓ Excel template loaded");
    console.log("✓ Application JavaScript bundled");
    console.log(
        `✓ Bulk photos loaded: ${photoCount}`
    );

    console.log(
        "============================================================"
    );

    console.log(
        "VERCEL BUILD COMPLETED SUCCESSFULLY"
    );

    console.log(
        "============================================================"
    );
}

try {
    build();
} catch (error) {
    console.error(
        "\nVERCEL BUILD FAILED:\n"
    );

    console.error(error);
    process.exit(1);
}