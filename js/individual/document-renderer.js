// ============================================================
// FILE: js/document-renderer.js
//
// PURPOSE:
//     Render synthetic OCR test documents using the existing
//     PAN and Aadhaar PNG templates.
//
// TEMPLATE SOURCES:
//     1. Vercel:
//        window.PAN_TEMPLATE_BASE64
//        window.AADHAAR_TEMPLATE_BASE64
//
//     2. Local development:
//        templates/PAN_Template.png
//        templates/AADHAR_Template.png
//
// IMPORTANT:
//     Existing PAN/Aadhaar coordinates and rendering behaviour
//     are preserved.
// ============================================================


// ============================================================
// PAN TEMPLATE CONFIGURATION
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
// AADHAAR TEMPLATE CONFIGURATION
// ============================================================

const AADHAAR_TEMPLATE_CONFIG = {

    canvas: {
        width: 1380,
        height: 772
    },

    photo: {
        x: 81,
        y: 271,
        width: 260,
        height: 307
    },

    name: {
        x: 610,
        y: 333,
        maxWidth: 455,
        font: "bold 32px Arial",
        color: "#17202a"
    },

    dob: {
        x: 610,
        y: 391,
        maxWidth: 455,
        font: "bold 32px Arial",
        color: "#17202a"
    },

    gender: {
        x: 611,
        y: 448,
        maxWidth: 455,
        font: "bold 32px Arial",
        color: "#17202a"
    },

    aadhaar: {
        x: 754,
        y: 590,
        font: "bold 44px Arial",
        color: "#17202a",
        align: "center"
    }
};


// ============================================================
// TEMPLATE CACHE
// ============================================================

const TEMPLATE_IMAGE_CACHE = {};


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
        String(type || "PAN").toUpperCase();


    const config =
        documentType === "PAN"
            ? PAN_TEMPLATE_CONFIG
            : AADHAAR_TEMPLATE_CONFIG;


    // --------------------------------------------------------
    // TEMPLATE SOURCE
    //
    // Vercel uses embedded Base64 templates.
    // Local development uses the PNG files directly.
    // --------------------------------------------------------

    let templateDataUrl =
        documentType === "PAN"
            ? window.PAN_TEMPLATE_BASE64
            : window.AADHAAR_TEMPLATE_BASE64;


    if (!templateDataUrl) {

        templateDataUrl =
            documentType === "PAN"
                ? "templates/individual/id/PAN_Template.png"
                : "templates/individual/id/AADHAR_Template.png";
    }


    // --------------------------------------------------------
    // LOAD TEMPLATE
    // --------------------------------------------------------

    const template =
        await loadTemplateImage(
            documentType,
            templateDataUrl
        );


    const ctx =
        canvas.getContext("2d");


    canvas.width =
        template.naturalWidth ||
        config.canvas.width;


    canvas.height =
        template.naturalHeight ||
        config.canvas.height;


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // --------------------------------------------------------
    // 1. DRAW PNG TEMPLATE
    // --------------------------------------------------------

    ctx.drawImage(
        template,
        0,
        0,
        canvas.width,
        canvas.height
    );


    // --------------------------------------------------------
    // 2. DRAW DYNAMIC DATA
    // --------------------------------------------------------

    if (documentType === "PAN") {

        renderPanData(
            ctx,
            person || {},
            config
        );

    } else {

        renderAadhaarData(
            ctx,
            person || {},
            config
        );
    }


    // --------------------------------------------------------
    // 3. DRAW UPLOADED PHOTO
    // --------------------------------------------------------

    await drawTemplatePhoto(
        ctx,
        photoDataUrl,
        config.photo
    );


    // --------------------------------------------------------
    // 4. SYNTHETIC TEST MARKER
    //
    // Disabled intentionally.
    // --------------------------------------------------------

    // drawSyntheticMarker(
    //     ctx,
    //     documentType
    // );
}


// ============================================================
// LOAD PNG TEMPLATE
// ============================================================

function loadTemplateImage(
    type,
    dataUrl
) {

    if (TEMPLATE_IMAGE_CACHE[type]) {

        return Promise.resolve(
            TEMPLATE_IMAGE_CACHE[type]
        );
    }


    return new Promise(
        (resolve, reject) => {

            const image =
                new Image();


            image.onload = () => {

                TEMPLATE_IMAGE_CACHE[type] =
                    image;

                resolve(image);
            };


            image.onerror = () => {

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
// AADHAAR DATA
// ============================================================

function renderAadhaarData(
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


    drawText(
        ctx,
        person.gender,
        config.gender
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
// TEXT DRAWING
// ============================================================

function drawText(
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


    ctx.textAlign =
        "left";

    ctx.textBaseline =
        "alphabetic";

    ctx.fillStyle =
        config.color || "#17202a";

    ctx.font =
        config.font || "14px Arial";


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


    if (!text) {
        return;
    }


    ctx.save();


    ctx.textAlign =
        config.align || "center";

    ctx.textBaseline =
        "alphabetic";

    ctx.fillStyle =
        config.color || "#17202a";

    ctx.font =
        config.font || "14px Arial";


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
// FIT TEXT TO WIDTH
// ============================================================

function fitTextToWidth(
    ctx,
    text,
    maxWidth
) {

    if (
        ctx.measureText(text).width <=
        maxWidth
    ) {

        return text;
    }


    let result = text;


    while (
        result.length > 1 &&
        ctx.measureText(
            `${result}...`
        ).width > maxWidth
    ) {

        result =
            result.slice(0, -1);
    }


    return `${result}...`;
}


// ============================================================
// PHOTO RENDERING
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


                // ------------------------------------------------
                // Cover the complete photo area while preserving
                // the original aspect ratio.
                // ------------------------------------------------

                if (
                    imageRatio > boxRatio
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

                } else {

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


            image.onerror = () => {

                // Photo failure should not stop
                // document generation.

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
        String(value || "")
            .replace(/\D/g, "")
            .slice(0, 12);


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
// SYNTHETIC TEST MARKER
// ============================================================

function drawSyntheticMarker(
    ctx,
    type
) {

    ctx.save();


    ctx.font =
        "bold 9px Arial";

    ctx.fillStyle =
        "rgba(180,30,30,.85)";

    ctx.textAlign =
        "right";

    ctx.textBaseline =
        "bottom";


    ctx.fillText(
        `SYNTHETIC ${type} TEST DATA`,
        ctx.canvas.width - 8,
        ctx.canvas.height - 6
    );


    ctx.restore();
}


// ============================================================
// DEBUG COORDINATE PICKER
//
// Browser console:
//
// enableCoordinatePicker(
//     document.getElementById("cardCanvas")
// );
//
// Then click the canvas to get native coordinates.
// ============================================================

function enableCoordinatePicker(
    canvas
) {

    if (!canvas) {

        console.error(
            "Canvas not found."
        );

        return;
    }


    canvas.addEventListener(
        "click",
        event => {

            const rect =
                canvas.getBoundingClientRect();


            const scaleX =
                canvas.width /
                rect.width;


            const scaleY =
                canvas.height /
                rect.height;


            const x =
                Math.round(
                    (
                        event.clientX -
                        rect.left
                    ) * scaleX
                );


            const y =
                Math.round(
                    (
                        event.clientY -
                        rect.top
                    ) * scaleY
                );


            console.log(
                `Template coordinate -> X: ${x}, Y: ${y}`
            );
        }
    );


    console.log(
        "OCR template coordinate picker enabled."
    );
}


// ============================================================
// EXPOSE CONFIGURATION
//
// Makes the current template configuration available to
// the rest of the application and debugging tools.
// ============================================================

window.OCR_TEMPLATE_CONFIG = {

    PAN:
        PAN_TEMPLATE_CONFIG,

    AADHAAR:
        AADHAAR_TEMPLATE_CONFIG
};
