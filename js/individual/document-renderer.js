// ============================================================
// FILE: js/individual/document-renderer.js
//
// PURPOSE:
//     Render synthetic OCR test documents using PNG templates.
//
// SUPPORTED:
//     PAN
//     Aadhaar Front
//     Aadhaar Back
//     Aadhaar Front + Back (Both)
//
// IMPORTANT:
//     Front and Back templates are completely separate.
//     Aadhaar Both uses the vertical combined PNG template
//     (Front on top, Back below).
// ============================================================


// ============================================================
// PAN TEMPLATE CONFIGURATION
//
// Actual template: 500 x 310
// ============================================================

const PAN_TEMPLATE_CONFIG = {

    canvas: {
        width: 500,
        height: 310
    },

    photo: {
        x: 20,
        y: 86,
        width: 91,
        height: 88
    },

    pan: {
        x: 240,
        y: 147,
        maxWidth: 125,
        font: "bold 16px Arial",
        color: "#17202a",
        align: "center"
    },

    name: {
        x: 21,
        y: 204,
        maxWidth: 245,
        font: "bold 12px Arial",
        color: "#17202a"
    },

    fatherName: {
        x: 21,
        y: 245,
        maxWidth: 245,
        font: "bold 12px Arial",
        color: "#17202a"
    },

    dob: {
        x: 17,
        y: 301,
        maxWidth: 138,
        font: "bold 12px Arial",
        color: "#17202a"
    }

};


// ============================================================
// AADHAAR FRONT TEMPLATE CONFIGURATION
//
// Actual template: 1393 x 755
// ============================================================

const AADHAAR_FRONT_TEMPLATE_CONFIG = {

    canvas: {
        width: 1393,
        height: 755
    },

    photo: {
        x: 315,
        y: 221,
        width: 216,
        height: 264
    },

    name: {
        x: 555,
        y: 291,
        maxWidth: 395,
        font: "bold 27px Arial",
        color: "#17202a"
    },

    dob: {
        x: 755,
        y: 349,
        maxWidth: 285,
        font: "bold 25px Arial",
        color: "#17202a"
    },

    aadhaar: {
        x: 774,
        y: 505,
        maxWidth: 420,
        font: "bold 30px Arial",
        color: "#17202a",
        align: "center"
    }

};


// ============================================================
// AADHAAR BACK TEMPLATE CONFIGURATION
//
// Actual template: 1415 x 707
// ============================================================

const AADHAAR_BACK_TEMPLATE_CONFIG = {

    canvas: {
        width: 1415,
        height: 707
    },

    address: {
        x: 365,
        y: 325,
        maxWidth: 430,
        maxLines: 3,
        lineHeight: 38,
        font: "bold 24px Arial",
        color: "#17202a"
    }

};


// ============================================================
// AADHAAR BOTH TEMPLATE CONFIGURATION
//
// Actual vertical combined template: 1466 x 1550
// Front on top (offset: x=36, y=38)
// Back below   (offset: x=14, y=804)
// ============================================================

const AADHAAR_BOTH_TEMPLATE_CONFIG = {

    canvas: {
        width: 1466,
        height: 1550
    },

    front: {
        offsetX: 36,
        offsetY: 38,

        photo: {
            x: 315,
            y: 221,
            width: 216,
            height: 264
        },

        name: {
            x: 555,
            y: 291,
            maxWidth: 395,
            font: "bold 27px Arial",
            color: "#17202a"
        },

        dob: {
            x: 755,
            y: 349,
            maxWidth: 285,
            font: "bold 25px Arial",
            color: "#17202a"
        },

        aadhaar: {
            x: 774,
            y: 505,
            maxWidth: 420,
            font: "bold 30px Arial",
            color: "#17202a",
            align: "center"
        }
    },

    back: {
        offsetX: 14,
        offsetY: 804,

        address: {
            x: 365,
            y: 325,
            maxWidth: 430,
            maxLines: 3,
            lineHeight: 38,
            font: "bold 24px Arial",
            color: "#17202a"
        }
    }

};


// ============================================================
// TEMPLATE CACHE
// ============================================================

const TEMPLATE_IMAGE_CACHE = {};


// ============================================================
// GET AADHAAR TEMPLATE
// ============================================================

function getAadhaarTemplate(type) {

    if (type === "Aadhaar_Back") {
        return {
            dataUrl:
                window.AADHAAR_BACK_TEMPLATE_BASE64 ||
                "templates/individual/id/AADHAR_Back_Template.png",
            config:
                AADHAAR_BACK_TEMPLATE_CONFIG
        };
    }

    if (type === "Aadhaar_Both") {
        return {
            dataUrl:
                window.AADHAAR_BOTH_TEMPLATE_BASE64 ||
                "templates/individual/id/AADHAR_Both_Template.png",
            config:
                AADHAAR_BOTH_TEMPLATE_CONFIG
        };
    }

    return {
        dataUrl:
            window.AADHAAR_FRONT_TEMPLATE_BASE64 ||
            window.AADHAAR_TEMPLATE_BASE64 ||
            "templates/individual/id/AADHAR_Front_Template.png",
        config:
            AADHAAR_FRONT_TEMPLATE_CONFIG
    };

}


// ============================================================
// MAIN DOCUMENT RENDERER
// ============================================================

async function drawSyntheticDocument(
    canvas,
    person,
    type = "PAN",
    photoDataUrl = null
) {

    const documentType =
        normalizeDocumentType(type);

    let config;
    let templateDataUrl;

    // ========================================================
    // PAN
    // ========================================================

    if (documentType === "PAN") {
        config =
            PAN_TEMPLATE_CONFIG;
        templateDataUrl =
            window.PAN_TEMPLATE_BASE64 ||
            "templates/individual/id/PAN_Template.png";
    }

    // ========================================================
    // AADHAAR FRONT
    // ========================================================

    else if (documentType === "Aadhaar_Front") {
        const template =
            getAadhaarTemplate("Aadhaar_Front");
        config =
            template.config;
        templateDataUrl =
            template.dataUrl;
    }

    // ========================================================
    // AADHAAR BACK
    // ========================================================

    else if (documentType === "Aadhaar_Back") {
        const template =
            getAadhaarTemplate("Aadhaar_Back");
        config =
            template.config;
        templateDataUrl =
            template.dataUrl;
    }

    // ========================================================
    // AADHAAR BOTH
    // ========================================================

    else if (documentType === "Aadhaar_Both") {
        const template =
            getAadhaarTemplate("Aadhaar_Both");
        config =
            template.config;
        templateDataUrl =
            template.dataUrl;
    }

    else {
        throw new Error(
            `Unsupported document type: ${type}`
        );
    }

    // ========================================================
    // LOAD TEMPLATE
    // ========================================================

    const template =
        await loadTemplateImage(
            documentType,
            templateDataUrl
        );

    // ========================================================
    // CANVAS
    // ========================================================

    const ctx =
        canvas.getContext("2d");

    canvas.width =
        template.naturalWidth ||
        config.canvas.width;

    canvas.height =
        template.naturalHeight ||
        config.canvas.height;

    // ========================================================
    // CLEAR & DRAW ORIGINAL TEMPLATE
    // ========================================================

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.drawImage(
        template,
        0,
        0,
        canvas.width,
        canvas.height
    );

    // ========================================================
    // DRAW DATA & PHOTO
    // ========================================================

    if (documentType === "PAN") {
        renderPanData(
            ctx,
            person || {},
            config
        );
        await drawTemplatePhoto(
            ctx,
            photoDataUrl,
            config.photo
        );
    } else if (documentType === "Aadhaar_Front") {
        renderAadhaarFrontData(
            ctx,
            person || {},
            config
        );
        await drawTemplatePhoto(
            ctx,
            photoDataUrl,
            config.photo
        );
    } else if (documentType === "Aadhaar_Back") {
        renderAadhaarBackData(
            ctx,
            person || {},
            config
        );
    } else if (documentType === "Aadhaar_Both") {
        await renderAadhaarBothData(
            ctx,
            person || {},
            photoDataUrl,
            config
        );
    }

}


// ============================================================
// NORMALIZE DOCUMENT TYPE
// ============================================================

function normalizeDocumentType(type) {

    const value =
        String(type || "PAN")
            .trim()
            .toLowerCase();

    if (value === "pan") {
        return "PAN";
    }

    if (
        value === "aadhaar" ||
        value === "aadhaar_front" ||
        value === "aadhaar front" ||
        value === "aadhaar_front_cards"
    ) {
        return "Aadhaar_Front";
    }

    if (
        value === "aadhaar_back" ||
        value === "aadhaar back" ||
        value === "aadhaar_back_cards"
    ) {
        return "Aadhaar_Back";
    }

    if (
        value === "aadhaar_both" ||
        value === "aadhaar both" ||
        value === "aadhaar_front_back" ||
        value === "aadhaar front + back" ||
        value === "aadhaar_both_cards" ||
        value === "aadhaar_both_test_cards"
    ) {
        return "Aadhaar_Both";
    }

    return type;

}


// ============================================================
// LOAD TEMPLATE
// ============================================================

function loadTemplateImage(
    type,
    dataUrl
) {

    const cacheKey =
        `${type}:${dataUrl}`;

    if (TEMPLATE_IMAGE_CACHE[cacheKey]) {
        return Promise.resolve(TEMPLATE_IMAGE_CACHE[cacheKey]);
    }

    return new Promise(
        (resolve, reject) => {
            const image = new Image();

            image.onload = () => {
                TEMPLATE_IMAGE_CACHE[cacheKey] = image;
                resolve(image);
            };

            image.onerror = () => {
                // If AADHAR_Front_Template.png failed, fallback to AADHAR_Template.png
                if (typeof dataUrl === "string" && dataUrl.includes("AADHAR_Front_Template.png")) {
                    const fallbackImg = new Image();
                    const fallbackUrl = dataUrl.replace("AADHAR_Front_Template.png", "AADHAR_Template.png");
                    fallbackImg.onload = () => {
                        TEMPLATE_IMAGE_CACHE[cacheKey] = fallbackImg;
                        resolve(fallbackImg);
                    };
                    fallbackImg.onerror = () => {
                        reject(new Error(`Unable to load ${type} PNG template.`));
                    };
                    fallbackImg.src = fallbackUrl;
                    return;
                }
                reject(
                    new Error(
                        `Unable to load ${type} PNG template.`
                    )
                );
            };

            image.src = dataUrl;
        }
    );

}


// ============================================================
// CREATE OFFSET CONFIG
//
// Shifts x/y coordinates by the specified offset.
// Preserves all other properties (width, height, font, etc.)
// ============================================================

function createOffsetConfig(
    config,
    offsetX = 0,
    offsetY = 0
) {

    if (!config) {
        return {};
    }

    const result = {
        ...config
    };

    if (typeof config.x === "number") {
        result.x = config.x + offsetX;
    }

    if (typeof config.y === "number") {
        result.y = config.y + offsetY;
    }

    return result;

}


// ============================================================
// PAN DATA
// ============================================================

function renderPanData(
    ctx,
    person,
    config
) {

    drawCenteredText(
        ctx,
        person.pan,
        config.pan
    );

    drawText(
        ctx,
        person.name,
        config.name
    );

    drawText(
        ctx,
        person.parentName,
        config.fatherName
    );

    drawText(
        ctx,
        person.dob,
        config.dob
    );

}


// ============================================================
// AADHAAR FRONT DATA
// ============================================================

function renderAadhaarFrontData(
    ctx,
    person,
    config
) {

    drawText(
        ctx,
        person.name,
        config.name
    );

    drawText(
        ctx,
        person.dob,
        config.dob
    );

    const aadhaar =
        formatAadhaarNumber(
            person.aadhaar
        );

    drawCenteredText(
        ctx,
        aadhaar,
        config.aadhaar
    );

}


// ============================================================
// AADHAAR BACK DATA
// ============================================================

function renderAadhaarBackData(
    ctx,
    person,
    config
) {

    drawMultilineText(
        ctx,
        person.address,
        config.address
    );

}


// ============================================================
// AADHAAR BOTH DATA
//
// Uses vertical combined template:
// Front side fields on top with front offset,
// Back side address below with back offset.
// ============================================================

async function renderAadhaarBothData(
    ctx,
    person,
    photoDataUrl,
    config
) {

    const templateConfig =
        config ||
        AADHAAR_BOTH_TEMPLATE_CONFIG;

    // ========================================================
    // FRONT
    // ========================================================

    const front =
        templateConfig.front;

    // NAME
    drawText(
        ctx,
        person.name,
        createOffsetConfig(
            front.name,
            front.offsetX,
            front.offsetY
        )
    );

    // DOB
    drawText(
        ctx,
        person.dob,
        createOffsetConfig(
            front.dob,
            front.offsetX,
            front.offsetY
        )
    );

    // AADHAAR NUMBER - FRONT
    const aadhaar =
        formatAadhaarNumber(
            person.aadhaar
        );

    drawCenteredText(
        ctx,
        aadhaar,
        createOffsetConfig(
            front.aadhaar,
            front.offsetX,
            front.offsetY
        )
    );

    // PHOTO - FRONT
    await drawTemplatePhoto(
        ctx,
        photoDataUrl,
        createOffsetConfig(
            front.photo,
            front.offsetX,
            front.offsetY
        )
    );

    // ========================================================
    // BACK
    // ========================================================

    const back =
        templateConfig.back;

    // ADDRESS - BACK
    drawMultilineText(
        ctx,
        person.address,
        createOffsetConfig(
            back.address,
            back.offsetX,
            back.offsetY
        )
    );

    // Optional back Aadhaar number if present in config
    if (back.aadhaar) {
        drawCenteredText(
            ctx,
            aadhaar,
            createOffsetConfig(
                back.aadhaar,
                back.offsetX,
                back.offsetY
            )
        );
    }

}


// ============================================================
// NORMAL TEXT
// ============================================================

function drawText(
    ctx,
    value,
    config
) {

    const text =
        String(value || "").trim();

    if (!text || !config) {
        return;
    }

    ctx.save();

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = config.color || "#17202a";
    ctx.font = config.font || "14px Arial";

    const fitted =
        fitTextToWidth(
            ctx,
            text,
            config.maxWidth || 1000
        );

    ctx.fillText(
        fitted,
        config.x,
        config.y
    );

    ctx.restore();

}


// ============================================================
// CENTERED TEXT
// ============================================================

function drawCenteredText(
    ctx,
    value,
    config
) {

    const text =
        String(value || "").trim();

    if (!text || !config) {
        return;
    }

    ctx.save();

    ctx.textAlign = config.align || "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = config.color || "#17202a";
    ctx.font = config.font || "14px Arial";

    const fitted =
        fitTextToWidth(
            ctx,
            text,
            config.maxWidth || 1000
        );

    ctx.fillText(
        fitted,
        config.x,
        config.y
    );

    ctx.restore();

}


// ============================================================
// MULTILINE TEXT
// ============================================================

function drawMultilineText(
    ctx,
    value,
    config
) {

    const text =
        String(value || "").trim();

    if (!text || !config) {
        return;
    }

    ctx.save();

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = config.color || "#17202a";
    ctx.font = config.font || "14px Arial";

    const maxWidth =
        config.maxWidth || 800;

    const lineHeight =
        config.lineHeight || 40;

    const maxLines =
        config.maxLines || 3;

    const words =
        text.split(/\s+/);

    const lines = [];
    let currentLine = "";

    words.forEach(
        function (word) {
            const testLine =
                currentLine
                    ? `${currentLine} ${word}`
                    : word;

            const width =
                ctx.measureText(testLine).width;

            if (width <= maxWidth) {
                currentLine = testLine;
            } else {
                if (currentLine) {
                    lines.push(currentLine);
                }
                currentLine = word;
            }
        }
    );

    if (currentLine) {
        lines.push(currentLine);
    }

    // Keep address within configured number of lines with ellipsis
    if (lines.length > maxLines) {
        const visibleLines = lines.slice(0, maxLines);
        let lastLine = visibleLines[maxLines - 1];
        while (
            ctx.measureText(`${lastLine}...`).width > maxWidth &&
            lastLine.length > 1
        ) {
            lastLine = lastLine.slice(0, -1);
        }
        visibleLines[maxLines - 1] = `${lastLine}...`;
        lines.length = 0;
        visibleLines.forEach(line => lines.push(line));
    }

    const visibleLines =
        lines.slice(0, maxLines);

    visibleLines.forEach(
        function (line, index) {
            ctx.fillText(
                line,
                config.x,
                config.y + (index * lineHeight)
            );
        }
    );

    ctx.restore();

}


// ============================================================
// FIT TEXT
// ============================================================

function fitTextToWidth(
    ctx,
    text,
    maxWidth
) {

    if (
        ctx.measureText(text).width <= maxWidth
    ) {
        return text;
    }

    let result = text;

    while (
        result.length > 1 &&
        ctx.measureText(`${result}...`).width > maxWidth
    ) {
        result = result.slice(0, -1);
    }

    return `${result}...`;

}


// ============================================================
// PHOTO
// ============================================================

function drawTemplatePhoto(
    ctx,
    photoDataUrl,
    config
) {

    return new Promise(
        resolve => {

            if (!photoDataUrl || !config) {
                resolve();
                return;
            }

            const image = new Image();

            image.onload = () => {

                ctx.save();

                ctx.beginPath();
                ctx.rect(
                    config.x,
                    config.y,
                    config.width,
                    config.height
                );
                ctx.clip();

                const imageRatio =
                    image.width / image.height;

                const boxRatio =
                    config.width / config.height;

                let drawWidth = config.width;
                let drawHeight = config.height;
                let drawX = config.x;
                let drawY = config.y;

                // Cover image: preserve aspect ratio
                if (imageRatio > boxRatio) {
                    drawHeight = config.height;
                    drawWidth = drawHeight * imageRatio;
                    drawX =
                        config.x +
                        (config.width - drawWidth) / 2;
                } else {
                    drawWidth = config.width;
                    drawHeight = drawWidth / imageRatio;
                    drawY =
                        config.y +
                        (config.height - drawHeight) / 2;
                }

                ctx.drawImage(
                    image,
                    drawX,
                    drawY,
                    drawWidth,
                    drawHeight
                );

                ctx.restore();
                resolve();

            };

            image.onerror = () => {
                resolve();
            };

            image.src = photoDataUrl;

        }
    );

}


// ============================================================
// AADHAAR NUMBER FORMAT
// ============================================================

function formatAadhaarNumber(value) {

    const digits =
        String(value || "")
            .replace(/\D/g, "")
            .slice(0, 12);

    if (!digits) {
        return "";
    }

    return digits
        .replace(/(.{4})/g, "$1 ")
        .trim();

}


// ============================================================
// EXPOSE CONFIG & FUNCTIONS
// ============================================================

window.OCR_TEMPLATE_CONFIG = {
    PAN: PAN_TEMPLATE_CONFIG,
    AADHAAR_FRONT: AADHAAR_FRONT_TEMPLATE_CONFIG,
    AADHAAR_BACK: AADHAAR_BACK_TEMPLATE_CONFIG,
    AADHAAR_BOTH: AADHAAR_BOTH_TEMPLATE_CONFIG
};

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        PAN_TEMPLATE_CONFIG,
        AADHAAR_FRONT_TEMPLATE_CONFIG,
        AADHAAR_BACK_TEMPLATE_CONFIG,
        AADHAAR_BOTH_TEMPLATE_CONFIG,
        getAadhaarTemplate,
        drawSyntheticDocument,
        normalizeDocumentType,
        loadTemplateImage,
        createOffsetConfig,
        renderPanData,
        renderAadhaarFrontData,
        renderAadhaarBackData,
        renderAadhaarBothData,
        drawText,
        drawCenteredText,
        drawMultilineText,
        fitTextToWidth,
        drawTemplatePhoto,
        formatAadhaarNumber
    };
}