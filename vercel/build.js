// ============================================================
// FILE: vercel/build.js
//
// PURPOSE:
//     Vercel deployment adapter for the OCR Test Data Generator.
//
// IMPORTANT:
//     This file does NOT modify the existing application files.
//
//     It creates a deployment-ready "dist" directory during
//     the Vercel build.
//
// WHY THIS EXISTS:
//
//     The application is a browser-based application.
//
//     Vercel needs a static deployment output.
//
//     Therefore this build script:
//         - Loads CSS
//         - Loads application JavaScript
//         - Loads PAN template
//         - Loads Aadhaar template
//         - Loads Excel template
//         - Loads bulk photos
//         - Creates dist/index.html
//
// CURRENT PROJECT STRUCTURE:
//
//     js/
//     ├── documents.js
//     ├── image-export.js
//     │
//     ├── individual/
//     │   ├── app.js
//     │   ├── data-generator.js
//     │   └── document-renderer.js
//     │
//     └── entity/
//         ├── app.js
//         ├── data-generator.js
//         └── document-renderer.js
//
// TEMPLATES:
//
//     templates/
//     └── individual/
//         └── id/
//             ├── PAN_Template.png
//             └── AADHAR_Template.png
//
// OUTPUT:
//
//     dist/
//     └── index.html
// ============================================================


const fs = require("fs");
const path = require("path");


// ============================================================
// PROJECT PATHS
// ============================================================

const ROOT_DIR =
    path.resolve(__dirname, "..");


const DIST_DIR =
    path.join(
        ROOT_DIR,
        "dist"
    );


const CSS_FILE =
    path.join(
        ROOT_DIR,
        "css",
        "style.css"
    );


const INDEX_FILE =
    path.join(
        ROOT_DIR,
        "index.html"
    );


const TEMPLATE_DIR =
    path.join(
        ROOT_DIR,
        "templates"
    );


const SAMPLE_DIR =
    path.join(
        ROOT_DIR,
        "sample"
    );


const PHOTO_DIR =
    path.join(
        ROOT_DIR,
        "BulkUpload_photos"
    );


// ============================================================
// APPLICATION JAVASCRIPT
//
// IMPORTANT:
//
//     The old project structure used:
//
//         js/data-generator.js
//         js/document-renderer.js
//         js/app.js
//
//     Those files no longer exist.
//
//     The application has now been separated into:
//
//         js/documents.js
//         js/image-export.js
//
//         js/individual/data-generator.js
//         js/individual/document-renderer.js
//         js/individual/app.js
//
//         js/entity/data-generator.js
//         js/entity/document-renderer.js
//         js/entity/app.js
//
//     Keep this order because application controllers depend
//     on functions defined by the previous files.
// ============================================================

const JS_FILES = [

    // --------------------------------------------------------
    // Shared configuration.
    // --------------------------------------------------------

    "js/documents.js",

    // --------------------------------------------------------
    // Shared image/export utilities.
    // --------------------------------------------------------

    "js/image-export.js",

    // --------------------------------------------------------
    // Individual document module.
    //
    // Generator must load before renderer.
    // Renderer must load before app.
    // --------------------------------------------------------

    "js/individual/data-generator.js",

    "js/individual/document-renderer.js",

    "js/individual/app.js",

    // --------------------------------------------------------
    // Entity document module.
    //
    // Generator must load before renderer.
    // Renderer must load before app.
    // --------------------------------------------------------

    "js/entity/data-generator.js",

    "js/entity/document-renderer.js",

    "js/entity/app.js"
];


// ============================================================
// SUPPORTED PHOTO TYPES
// ============================================================

const SUPPORTED_PHOTO_TYPES = {

    ".jpg":
        "image/jpeg",

    ".jpeg":
        "image/jpeg",

    ".png":
        "image/png",

    ".webp":
        "image/webp",

    ".gif":
        "image/gif"
};


// ============================================================
// UTILITY: READ TEXT FILE
// ============================================================

function readText(filePath) {

    if (!fs.existsSync(filePath)) {

        throw new Error(
            `Required file not found: ${filePath}`
        );
    }

    return fs.readFileSync(
        filePath,
        "utf8"
    );
}


// ============================================================
// UTILITY: CONVERT FILE TO BASE64
// ============================================================

function fileToBase64(filePath) {

    if (!fs.existsSync(filePath)) {

        throw new Error(
            `Required file not found: ${filePath}`
        );
    }

    return fs
        .readFileSync(filePath)
        .toString("base64");
}


// ============================================================
// UTILITY: CREATE DATA URL
// ============================================================

function fileToDataUrl(
    filePath,
    mimeType
) {

    return (
        `data:${mimeType};base64,` +
        fileToBase64(filePath)
    );
}


// ============================================================
// CLEAN DIST DIRECTORY
//
// Every deployment starts from a clean build.
// ============================================================

function cleanDist() {

    if (
        fs.existsSync(
            DIST_DIR
        )
    ) {

        fs.rmSync(
            DIST_DIR,
            {
                recursive: true,
                force: true
            }
        );
    }


    fs.mkdirSync(
        DIST_DIR,
        {
            recursive: true
        }
    );
}


// ============================================================
// LOAD PAN TEMPLATE
//
// Shared individual PAN template.
//
// Current location:
//
//     templates/individual/id/PAN_Template.png
// ============================================================

function loadPanTemplate() {

    const filePath =
        path.join(
            TEMPLATE_DIR,
            "individual",
            "id",
            "PAN_Template.png"
        );

    return fileToDataUrl(
        filePath,
        "image/png"
    );
}


// ============================================================
// LOAD AADHAAR TEMPLATE
//
// Current location:
//
//     templates/individual/id/AADHAR_Template.png
// ============================================================

function loadAadhaarTemplate() {

    const filePath =
        path.join(
            TEMPLATE_DIR,
            "individual",
            "id",
            "AADHAR_Template.png"
        );

    return fileToDataUrl(
        filePath,
        "image/png"
    );
}


// ============================================================
// LOAD SAMPLE EXCEL
//
// This matches the browser variable used by the existing
// application.
//
// Current location:
//
//     sample/ocr-test-data-template.xlsx
// ============================================================

function loadExcelTemplate() {

    const filePath =
        path.join(
            SAMPLE_DIR,
            "ocr-test-data-template.xlsx"
        );

    return fileToBase64(
        filePath
    );
}


// ============================================================
// LOAD BULK PHOTOS
//
// Existing BulkUpload_photos files are converted into data URLs
// so the browser can access them from the generated deployment.
//
// If the folder is empty, an empty object is returned.
// ============================================================

function loadBulkPhotos() {

    const result = {};


    if (
        !fs.existsSync(
            PHOTO_DIR
        )
    ) {

        return result;
    }


    const files =
        fs.readdirSync(
            PHOTO_DIR
        );


    for (
        const filename of files
    ) {

        const filePath =
            path.join(
                PHOTO_DIR,
                filename
            );


        if (
            !fs.statSync(
                filePath
            ).isFile()
        ) {

            continue;
        }


        const extension =
            path.extname(
                filename
            ).toLowerCase();


        const mimeType =
            SUPPORTED_PHOTO_TYPES[
                extension
            ];


        if (!mimeType) {

            continue;
        }


        result[filename] =
            fileToDataUrl(
                filePath,
                mimeType
            );
    }


    return result;
}


// ============================================================
// LOAD APPLICATION JAVASCRIPT
//
// We inline the existing JS files into the final deployment
// page.
//
// JS_FILES contains paths relative to the project root.
//
// Example:
//
//     js/entity/app.js
//
// The original source files are NOT modified.
// ============================================================

function loadApplicationJavaScript() {

    return JS_FILES
        .map(
            fileName => {

                const filePath =
                    path.join(
                        ROOT_DIR,
                        fileName
                    );


                const source =
                    readText(
                        filePath
                    );


                return (
                    `\n\n` +
                    `// ============================================================\n` +
                    `// VERCEL BUILD: ${fileName}\n` +
                    `// ============================================================\n\n` +
                    source
                );
            }
        )
        .join("\n");
}


// ============================================================
// REMOVE LOCAL SCRIPT REFERENCES
//
// The JavaScript is embedded into the generated HTML.
//
// Therefore local <script src="..."> references need to be
// removed from index.html.
//
// This supports nested paths such as:
//
//     js/individual/app.js
//     js/entity/app.js
// ============================================================

function removeApplicationScriptReferences(html) {

    for (
        const fileName of JS_FILES
    ) {

        const scriptTag =
            `<script src="${fileName}"></script>`;


        html =
            html.replace(
                scriptTag,
                ""
            );
    }


    return html;
}


// ============================================================
// PREPARE INDEX HTML
// ============================================================

function createDeploymentHtml() {

    let html =
        readText(
            INDEX_FILE
        );


    // --------------------------------------------------------
    // Load CSS
    // --------------------------------------------------------

    const css =
        readText(
            CSS_FILE
        );


    // --------------------------------------------------------
    // Load templates/assets
    // --------------------------------------------------------

    const panTemplate =
        loadPanTemplate();


    const aadhaarTemplate =
        loadAadhaarTemplate();


    const excelTemplate =
        loadExcelTemplate();


    const bulkPhotos =
        loadBulkPhotos();


    const bulkPhotoCount =
        Object.keys(
            bulkPhotos
        ).length;


    // --------------------------------------------------------
    // Remove external local CSS reference.
    //
    // CSS will be embedded directly into the deployment HTML.
    // --------------------------------------------------------

    html =
        html.replace(
            '<link rel="stylesheet" href="css/style.css">',
            `<style>\n${css}\n</style>`
        );


    // --------------------------------------------------------
    // Remove local JavaScript references.
    //
    // JavaScript will be embedded directly into the deployment
    // HTML.
    // --------------------------------------------------------

    html =
        removeApplicationScriptReferences(
            html
        );


    // --------------------------------------------------------
    // Load existing application JavaScript.
    // --------------------------------------------------------

    const applicationJs =
        loadApplicationJavaScript();


    // --------------------------------------------------------
    // Runtime variables.
    //
    // These variables are available to the browser application.
    // --------------------------------------------------------

    const runtimeData = `

<script>

// ============================================================
// VERCEL RUNTIME ASSETS
// ============================================================

window.PAN_TEMPLATE_BASE64 =
    ${JSON.stringify(panTemplate)};


window.AADHAAR_TEMPLATE_BASE64 =
    ${JSON.stringify(aadhaarTemplate)};


window.OCR_TEMPLATE_BASE64 =
    ${JSON.stringify(excelTemplate)};


window.BULK_PHOTOS =
    ${JSON.stringify(bulkPhotos)};


window.BULK_PHOTO_COUNT =
    ${bulkPhotoCount};

</script>
`;


    // --------------------------------------------------------
    // Insert runtime variables and application JavaScript
    // before the closing body tag.
    // --------------------------------------------------------

    html =
        html.replace(
            "</body>",
            `${runtimeData}
<script>
${applicationJs}
</script>
</body>`
        );


    return html;
}


// ============================================================
// BUILD
// ============================================================

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


    // --------------------------------------------------------
    // Clean output directory.
    // --------------------------------------------------------

    cleanDist();


    // --------------------------------------------------------
    // Generate final HTML.
    // --------------------------------------------------------

    const finalHtml =
        createDeploymentHtml();


    // --------------------------------------------------------
    // Write deployment HTML.
    // --------------------------------------------------------

    const outputFile =
        path.join(
            DIST_DIR,
            "index.html"
        );


    fs.writeFileSync(
        outputFile,
        finalHtml,
        "utf8"
    );


    console.log(
        "✓ Generated dist/index.html"
    );


    console.log(
        "✓ PAN template loaded"
    );


    console.log(
        "✓ Aadhaar template loaded"
    );


    console.log(
        "✓ Excel template loaded"
    );


    console.log(
        "✓ Application JavaScript bundled"
    );


    console.log(
        `✓ Bulk photos loaded: ${Object.keys(loadBulkPhotos()).length}`
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


// ============================================================
// BUILD ENTRY POINT
// ============================================================

try {

    build();

} catch (error) {

    console.error(
        "\nVERCEL BUILD FAILED:\n"
    );

    console.error(
        error
    );

    process.exit(1);
}