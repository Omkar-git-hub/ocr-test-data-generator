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
//     The Streamlit version of the application injects the
//     document templates and other assets into the browser as
//     Base64 data.
//
//     Vercel does not execute streamlit_app.py.
//
//     Therefore this build script performs the same preparation
//     during the Vercel build.
//
// CURRENT APPLICATION FILES REMAIN UNCHANGED.
//
// FLOW:
//
//     Existing project
//          |
//          v
//     vercel/build.js
//          |
//          +--> CSS
//          +--> JavaScript
//          +--> PAN template
//          +--> Aadhaar template
//          +--> Excel template
//          |
//          v
//        dist/
//          |
//          v
//       Vercel
// ============================================================

const fs = require("fs");
const path = require("path");


// ============================================================
// PROJECT PATHS
// ============================================================

const ROOT_DIR =
    path.resolve(__dirname, "..");

const DIST_DIR =
    path.join(ROOT_DIR, "dist");

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
// Keep the same order used by index.html.
//
// This is important because app.js depends on functions defined
// by the previous JavaScript files.
// ============================================================

const JS_FILES = [

    "data-generator.js",

    "document-renderer.js",

    "image-export.js",

    "app.js"
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
// ============================================================

function loadPanTemplate() {

    const filePath =
        path.join(
            TEMPLATE_DIR,
            "PAN_Template.png"
        );

    return fileToDataUrl(
        filePath,
        "image/png"
    );
}


// ============================================================
// LOAD AADHAAR TEMPLATE
// ============================================================

function loadAadhaarTemplate() {

    const filePath =
        path.join(
            TEMPLATE_DIR,
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
// Streamlit deployment.
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
// so the browser can access them exactly like the Streamlit
// deployment.
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
// IMPORTANT:
//     The source JS files are NOT modified.
// ============================================================

function loadApplicationJavaScript() {

    return JS_FILES
        .map(
            filename => {

                const filePath =
                    path.join(
                        ROOT_DIR,
                        "js",
                        filename
                    );


                const source =
                    readText(
                        filePath
                    );


                return (
                    `\n\n` +
                    `// ============================================================\n` +
                    `// VERCEL BUILD: ${filename}\n` +
                    `// ============================================================\n\n` +
                    source
                );
            }
        )
        .join("\n");
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
    // JS will be embedded into the deployment HTML.
    // --------------------------------------------------------

    for (
        const filename of JS_FILES
    ) {

        html =
            html.replace(
                `<script src="js/${filename}"></script>`,
                ""
            );
    }


    // --------------------------------------------------------
    // Load existing application JS.
    // --------------------------------------------------------

    const applicationJs =
        loadApplicationJavaScript();


    // --------------------------------------------------------
    // Runtime variables.
    //
    // These are the SAME type of variables that the existing
    // Streamlit deployment provides.
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
    // Insert runtime variables before application JavaScript.
    // --------------------------------------------------------

    html =
        html.replace(
            "</body>",
            `${runtimeData}\n<script>\n${applicationJs}\n</script>\n</body>`
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
        `✓ PAN template loaded`
    );


    console.log(
        `✓ Aadhaar template loaded`
    );


    console.log(
        `✓ Excel template loaded`
    );


    console.log(
        `✓ Application JavaScript bundled`
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