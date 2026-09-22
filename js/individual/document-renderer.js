// ============================================================
// FILE: js/document-renderer.js
//
// PURPOSE:
//     Render synthetic OCR test documents using PNG templates.
//
// SUPPORTED:
//     PAN
//     Aadhaar Front
//     Aadhaar Back
//     Aadhaar Front + Back
//
// IMPORTANT:
//     Front and Back templates are completely separate.
//     BOTH uses the actual vertical combined template.
// ============================================================


// ============================================================
// PAN TEMPLATE
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
// AADHAAR FRONT TEMPLATE
//
// Coordinates are based on the actual Front_Adhaar.png
//
// Actual template:
//     1393 x 755
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
// AADHAAR BACK TEMPLATE
//
// Coordinates are based on actual Back_Adhaar.png
//
// Actual template:
//     1415 x 707
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
// AADHAAR BOTH TEMPLATE
//
// Actual combined template:
//
//     Width  = 1466
//     Height = 1550
//
// Front and Back are VERTICAL.
//
// Front starts:
//     Y = 0
//
// Back starts around:
//     Y = 775
//
// We use ABSOLUTE coordinates from the actual combined PNG.
// ============================================================

const AADHAAR_BOTH_TEMPLATE_CONFIG = {

    canvas: {
        width: 1466,
        height: 1550
    },


    front: {

        photo: {
            x: 351,
            y: 259,
            width: 216,
            height: 264
        },

        name: {
            x: 590,
            y: 331,
            maxWidth: 395,
            font: "bold 27px Arial",
            color: "#17202a"
        },

        dob: {
            x: 785,
            y: 393,
            maxWidth: 285,
            font: "bold 25px Arial",
            color: "#17202a"
        },

        aadhaar: {
            x: 811,
            y: 505,
            maxWidth: 420,
            font: "bold 30px Arial",
            color: "#17202a",
            align: "center"
        }

    },


    back: {

        address: {
            x: 380,
            y: 1120,
            maxWidth: 420,
            maxLines: 4,
            lineHeight: 36,
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

    else if (
        documentType === "Aadhaar_Front"
    ) {

        const template =
            getAadhaarTemplate(
                "Aadhaar_Front"
            );


        config =
            template.config;


        templateDataUrl =
            template.dataUrl;

    }


    // ========================================================
    // AADHAAR BACK
    // ========================================================

    else if (
        documentType === "Aadhaar_Back"
    ) {

        const template =
            getAadhaarTemplate(
                "Aadhaar_Back"
            );


        config =
            template.config;


        templateDataUrl =
            template.dataUrl;

    }


    // ========================================================
    // AADHAAR BOTH
    // ========================================================

    else if (
        documentType === "Aadhaar_Both"
    ) {

        const template =
            getAadhaarTemplate(
                "Aadhaar_Both"
            );


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
    // CLEAR
    // ========================================================

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // ========================================================
    // DRAW ORIGINAL TEMPLATE
    // ========================================================

    ctx.drawImage(
        template,
        0,
        0,
        canvas.width,
        canvas.height
    );


    // ========================================================
    // PAN
    // ========================================================

    if (
        documentType === "PAN"
    ) {

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

    }


    // ========================================================
    // AADHAAR FRONT
    // ========================================================

    else if (
        documentType === "Aadhaar_Front"
    ) {

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

    }


    // ========================================================
    // AADHAAR BACK
    // ========================================================

    else if (
        documentType === "Aadhaar_Back"
    ) {

        renderAadhaarBackData(
            ctx,
            person || {},
            config
        );

    }


    // ========================================================
    // AADHAAR BOTH
    // ========================================================

    else if (
        documentType === "Aadhaar_Both"
    ) {

        renderAadhaarBothData(
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
        String(
            type || "PAN"
        ).trim()
            .toLowerCase();


    if (value === "pan") {

        return "PAN";

    }


    if (
        value === "aadhaar" ||
        value === "aadhaar_front"
    ) {

        return "Aadhaar_Front";

    }


    if (
        value === "aadhaar_back"
    ) {

        return "Aadhaar_Back";

    }


    if (
        value === "aadhaar_both"
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


    if (
        TEMPLATE_IMAGE_CACHE[
        cacheKey
        ]
    ) {

        return Promise.resolve(
            TEMPLATE_IMAGE_CACHE[
            cacheKey
            ]
        );

    }


    return new Promise(
        (
            resolve,
            reject
        ) => {

            const image =
                new Image();


            image.onload =
                () => {

                    TEMPLATE_IMAGE_CACHE[
                        cacheKey
                    ] = image;


                    resolve(
                        image
                    );

                };


            image.onerror =
                () => {

                    reject(
                        new Error(
                            `Unable to load ${type} PNG template.`
                        )
                    );

                };


            image.src =
                dataUrl;

        }
    );

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
// AADHAAR FRONT
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
// AADHAAR BACK
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
// AADHAAR BOTH
// ============================================================

async function renderAadhaarBothData(
    ctx,
    person,
    photoDataUrl,
    config
) {

    // --------------------------------------------------------
    // FRONT
    // --------------------------------------------------------

    drawText(
        ctx,
        person.name,
        config.front.name
    );


    drawText(
        ctx,
        person.dob,
        config.front.dob
    );


    const aadhaar =
        formatAadhaarNumber(
            person.aadhaar
        );


    drawCenteredText(
        ctx,
        aadhaar,
        config.front.aadhaar
    );


    await drawTemplatePhoto(
        ctx,
        photoDataUrl,
        config.front.photo
    );


    // --------------------------------------------------------
    // BACK
    // --------------------------------------------------------

    drawMultilineText(
        ctx,
        person.address,
        config.back.address
    );

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
        String(
            value || ""
        ).trim();


    if (!text) {

        return;

    }


    ctx.save();


    ctx.textAlign =
        "left";


    ctx.textBaseline =
        "alphabetic";


    ctx.fillStyle =
        config.color ||
        "#17202a";


    ctx.font =
        config.font ||
        "14px Arial";


    const fitted =
        fitTextToWidth(
            ctx,
            text,
            config.maxWidth ||
            1000
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
        String(
            value || ""
        ).trim();


    if (!text) {

        return;

    }


    ctx.save();


    ctx.textAlign =
        config.align ||
        "center";


    ctx.textBaseline =
        "alphabetic";


    ctx.fillStyle =
        config.color ||
        "#17202a";


    ctx.font =
        config.font ||
        "14px Arial";


    const fitted =
        fitTextToWidth(
            ctx,
            text,
            config.maxWidth ||
            1000
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
//
// Used mainly for Aadhaar BACK address.
// ============================================================

function drawMultilineText(
    ctx,
    value,
    config
) {

    const text =
        String(value || "").trim();

    if (!text) {
        return;
    }

    ctx.save();

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle =
        config.color || "#17202a";

    ctx.font =
        config.font || "14px Arial";

    const words =
        text.split(/\s+/);

    const lines = [];

    let line = "";

    const maxWidth =
        config.maxWidth || 400;

    const maxLines =
        config.maxLines || 3;

    for (const word of words) {

        const testLine =
            line
                ? `${line} ${word}`
                : word;

        const width =
            ctx.measureText(
                testLine
            ).width;

        if (
            width > maxWidth &&
            line
        ) {

            lines.push(line);

            line = word;

        } else {

            line = testLine;

        }
    }

    if (line) {
        lines.push(line);
    }

    // Keep address within configured number of lines
    if (lines.length > maxLines) {

        const visibleLines =
            lines.slice(0, maxLines);

        let remaining =
            lines
                .slice(maxLines - 1)
                .join(" ");

        let lastLine =
            visibleLines[maxLines - 1];

        while (
            ctx.measureText(
                `${lastLine}...`
            ).width > maxWidth &&
            lastLine.length > 1
        ) {

            lastLine =
                lastLine.slice(0, -1);
        }

        visibleLines[maxLines - 1] =
            `${lastLine}...`;

        lines.length = 0;

        visibleLines.forEach(
            line => lines.push(line)
        );
    }

    const lineHeight =
        config.lineHeight || 36;

    lines.forEach(
        (line, index) => {

            ctx.fillText(
                line,
                config.x,
                config.y +
                index * lineHeight
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
        ctx.measureText(
            text
        ).width <=
        maxWidth
    ) {

        return text;

    }


    let result =
        text;


    while (
        result.length > 1 &&
        ctx.measureText(
            `${result}...`
        ).width >
        maxWidth
    ) {

        result =
            result.slice(
                0,
                -1
            );

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

            if (!photoDataUrl) {

                resolve();

                return;

            }


            const image =
                new Image();


            image.onload =
                () => {

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
                        image.width /
                        image.height;


                    const boxRatio =
                        config.width /
                        config.height;


                    let drawWidth =
                        config.width;


                    let drawHeight =
                        config.height;


                    let drawX =
                        config.x;


                    let drawY =
                        config.y;


                    if (
                        imageRatio >
                        boxRatio
                    ) {

                        drawHeight =
                            config.height;


                        drawWidth =
                            drawHeight *
                            imageRatio;


                        drawX =
                            config.x +
                            (
                                config.width -
                                drawWidth
                            ) / 2;

                    }
                    else {

                        drawWidth =
                            config.width;


                        drawHeight =
                            drawWidth /
                            imageRatio;


                        drawY =
                            config.y +
                            (
                                config.height -
                                drawHeight
                            ) / 2;

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


            image.onerror =
                () => {

                    resolve();

                };


            image.src =
                photoDataUrl;

        }
    );

}


// ============================================================
// AADHAAR NUMBER FORMAT
// ============================================================

function formatAadhaarNumber(
    value
) {

    const digits =
        String(
            value || ""
        )
            .replace(
                /\D/g,
                ""
            )
            .slice(
                0,
                12
            );


    if (!digits) {

        return "";

    }


    return digits
        .replace(
            /(.{4})/g,
            "$1 "
        )
        .trim();

}


// ============================================================
// EXPOSE CONFIG
// ============================================================

window.OCR_TEMPLATE_CONFIG = {

    PAN:
        PAN_TEMPLATE_CONFIG,

    AADHAAR_FRONT:
        AADHAAR_FRONT_TEMPLATE_CONFIG,

    AADHAAR_BACK:
        AADHAAR_BACK_TEMPLATE_CONFIG,

    AADHAAR_BOTH:
        AADHAAR_BOTH_TEMPLATE_CONFIG

};