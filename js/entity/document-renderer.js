// ============================================================
// FILE: js/entity/document-renderer.js
//
// PURPOSE:
//     Render synthetic Entity PAN test documents.
//
// WORK:
//     Uses the SAME PAN template and SAME coordinates as the
//     Individual PAN renderer.
//
// ENTITY FIELD MAPPING:
//     Entity PAN               -> Individual PAN field
//     Entity Name              -> Individual Name field
//     Registration Number      -> Individual Father Name field
//     Date of Incorporation   -> Individual DOB field
//     Entity Logo              -> Individual Photo field
//
// IMPORTANT:
//     Only ONE PAN template is used.
//
//     Template:
//         templates/individual/id/PAN_Template.png
//
//     Do NOT create another Entity PAN template.
// ============================================================


// ============================================================
// SHARED PAN TEMPLATE
// ============================================================

const ENTITY_PAN_TEMPLATE =
    "templates/individual/id/PAN_Template.png";


// ============================================================
// ENTITY PAN CONFIGURATION
//
// IMPORTANT:
//     These coordinates are copied directly from the working
//     Individual PAN renderer.
//
//     Individual PAN configuration:
//
//         Canvas : 500 x 310
//
//         Photo :
//             x      = 20
//             y      = 86
//             width  = 91
//             height = 88
//
//         PAN :
//             x = 240
//             y = 147
//
//         Name :
//             x = 21
//             y = 204
//
//         Father Name :
//             x = 21
//             y = 245
//
//         DOB :
//             x = 17
//             y = 301
//
//     Entity renderer intentionally uses these SAME positions.
// ============================================================

const ENTITY_PAN_CONFIG = {

    // --------------------------------------------------------
    // Canvas
    // --------------------------------------------------------

    canvas: {

        width: 500,

        height: 310
    },


    // --------------------------------------------------------
    // Shared PAN template
    // --------------------------------------------------------

    template:
        ENTITY_PAN_TEMPLATE,


    // ========================================================
    // ENTITY LOGO / IMAGE
    //
    // Same position as Individual PAN photo.
    // ========================================================

    photo: {

        x: 20,

        y: 86,

        width: 91,

        height: 88
    },


    // ========================================================
    // ENTITY PAN
    //
    // Same position as Individual PAN number.
    // ========================================================

    pan: {

        x: 240,

        y: 147,

        maxWidth: 125,

        font: "bold 16px Arial",

        color: "#17202a",

        align: "center"
    },


    // ========================================================
    // ENTITY NAME
    //
    // Same position as Individual Name.
    // ========================================================

    entityName: {

        x: 21,

        y: 204,

        maxWidth: 245,

        font: "bold 12px Arial",

        color: "#17202a"
    },


    // ========================================================
    // REGISTRATION NUMBER
    //
    // Same position as Individual Father's Name.
    //
    // We intentionally reuse this field because the shared
    // PAN template has no separate Registration Number field.
    // ========================================================

    registrationNumber: {

        x: 21,

        y: 245,

        maxWidth: 245,

        font: "bold 12px Arial",

        color: "#17202a"
    },


    // ========================================================
    // DATE OF INCORPORATION
    //
    // Same position as Individual DOB.
    // ========================================================

    incorporationDate: {

        x: 17,

        y: 301,

        maxWidth: 138,

        font: "bold 12px Arial",

        color: "#17202a"
    }
};


// ============================================================
// TEMPLATE CACHE
//
// Prevents loading the same PNG repeatedly.
// ============================================================

let ENTITY_PAN_TEMPLATE_CACHE = null;


// ============================================================
// LOAD ENTITY PAN TEMPLATE
//
// Uses the SAME Individual PAN template.
// ============================================================

function loadEntityTemplate() {

    if (ENTITY_PAN_TEMPLATE_CACHE) {

        return Promise.resolve(
            ENTITY_PAN_TEMPLATE_CACHE
        );
    }


    return new Promise(
        (resolve, reject) => {

            const image =
                new Image();


            image.onload = () => {

                ENTITY_PAN_TEMPLATE_CACHE =
                    image;


                resolve(image);
            };


            image.onerror = () => {

                reject(
                    new Error(
                        "Unable to load Entity PAN template: " +
                        ENTITY_PAN_TEMPLATE
                    )
                );
            };


            image.src =
                ENTITY_PAN_TEMPLATE;
        }
    );
}


// ============================================================
// LOAD ENTITY IMAGE
//
// Supports:
//     - File
//     - Blob
//     - Data URL
//     - Image URL
// ============================================================

function loadEntityImage(
    source
) {

    return new Promise(
        resolve => {

            if (!source) {

                resolve(null);

                return;
            }


            const image =
                new Image();


            // ------------------------------------------------
            // Existing URL / Data URL
            // ------------------------------------------------

            if (
                typeof source === "string"
            ) {

                image.onload = () => {

                    resolve(image);
                };


                image.onerror = () => {

                    resolve(null);
                };


                image.src =
                    source;

                return;
            }


            // ------------------------------------------------
            // Uploaded File / Blob
            // ------------------------------------------------

            if (
                source instanceof Blob
            ) {

                const objectUrl =
                    URL.createObjectURL(
                        source
                    );


                image.onload = () => {

                    URL.revokeObjectURL(
                        objectUrl
                    );


                    resolve(image);
                };


                image.onerror = () => {

                    URL.revokeObjectURL(
                        objectUrl
                    );


                    resolve(null);
                };


                image.src =
                    objectUrl;

                return;
            }


            resolve(null);
        }
    );
}


// ============================================================
// FIT TEXT TO WIDTH
//
// Same basic behaviour as Individual renderer.
//
// Prevents long Entity names or Registration Numbers from
// overflowing the original PAN fields.
// ============================================================

function fitEntityTextToWidth(
    context,
    text,
    maxWidth
) {

    if (!maxWidth) {

        return text;
    }


    if (
        context.measureText(text).width <=
        maxWidth
    ) {

        return text;
    }


    let result =
        text;


    while (
        result.length > 1 &&
        context.measureText(
            `${result}...`
        ).width > maxWidth
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
// DRAW LEFT-ALIGNED TEXT
//
// Same style as Individual renderer.
// ============================================================

function drawEntityText(
    context,
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


    context.save();


    context.textAlign =
        "left";


    context.textBaseline =
        "alphabetic";


    context.fillStyle =
        config.color ||
        "#17202a";


    context.font =
        config.font ||
        "14px Arial";


    const fittedText =
        fitEntityTextToWidth(
            context,
            text,
            config.maxWidth
        );


    context.fillText(
        fittedText,
        config.x,
        config.y
    );


    context.restore();
}


// ============================================================
// DRAW CENTERED TEXT
//
// Used for Entity PAN number.
//
// Same configuration as Individual PAN renderer.
// ============================================================

function drawEntityCenteredText(
    context,
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


    context.save();


    context.textAlign =
        config.align ||
        "center";


    context.textBaseline =
        "alphabetic";


    context.fillStyle =
        config.color ||
        "#17202a";


    context.font =
        config.font ||
        "14px Arial";


    const fittedText =
        fitEntityTextToWidth(
            context,
            text,
            config.maxWidth
        );


    context.fillText(
        fittedText,
        config.x,
        config.y
    );


    context.restore();
}


// ============================================================
// DRAW ENTITY PHOTO / LOGO
//
// Uses the EXACT same photo area as Individual PAN.
//
// Image behaviour:
//     - Keeps aspect ratio.
//     - Covers the complete photo box.
//     - Clips to the original photo area.
// ============================================================

function drawEntityPhoto(
    context,
    image,
    config
) {

    if (!image) {

        return;
    }


    context.save();


    // --------------------------------------------------------
    // Clip to original photo area.
    // --------------------------------------------------------

    context.beginPath();


    context.rect(
        config.x,
        config.y,
        config.width,
        config.height
    );


    context.clip();


    // --------------------------------------------------------
    // Source dimensions.
    // --------------------------------------------------------

    const imageWidth =
        image.naturalWidth ||
        image.width;


    const imageHeight =
        image.naturalHeight ||
        image.height;


    if (
        !imageWidth ||
        !imageHeight
    ) {

        context.restore();

        return;
    }


    // --------------------------------------------------------
    // Calculate aspect ratios.
    // --------------------------------------------------------

    const imageRatio =
        imageWidth /
        imageHeight;


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


    // --------------------------------------------------------
    // Cover photo area while preserving aspect ratio.
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // Draw image.
    // --------------------------------------------------------

    context.drawImage(
        image,
        drawX,
        drawY,
        drawWidth,
        drawHeight
    );


    context.restore();
}


// ============================================================
// RENDER ENTITY DATA
//
// This is the Entity equivalent of Individual renderPanData().
//
// Individual:
//
//     person.pan
//     person.name
//     person.parentName
//     person.dob
//
// Entity:
//
//     entityData.pan
//     entityData.entityName
//     entityData.registrationNumber
//     entityData.incorporationDate
// ============================================================

function renderEntityData(
    context,
    entityData,
    config
) {

    // --------------------------------------------------------
    // PAN
    // --------------------------------------------------------

    drawEntityCenteredText(
        context,
        entityData.pan,
        config.pan
    );


    // --------------------------------------------------------
    // Entity Name
    // --------------------------------------------------------

    drawEntityText(
        context,
        entityData.entityName,
        config.entityName
    );


    // --------------------------------------------------------
    // Registration Number
    //
    // Uses Father's Name field.
    // --------------------------------------------------------

    drawEntityText(
        context,
        entityData.registrationNumber,
        config.registrationNumber
    );


    // --------------------------------------------------------
    // Date of Incorporation
    //
    // Uses DOB field.
    // --------------------------------------------------------

    drawEntityText(
        context,
        entityData.incorporationDate,
        config.incorporationDate
    );
}


// ============================================================
// DRAW COMPLETE ENTITY PAN DOCUMENT
//
// Creates a new canvas containing:
//
//     1. Original PAN template
//     2. Entity PAN
//     3. Entity Name
//     4. Registration Number
//     5. Date of Incorporation
//     6. Optional Entity logo
// ============================================================

async function drawEntityPANDocument(
    entityData = {}
) {

    // --------------------------------------------------------
    // Load shared template.
    // --------------------------------------------------------

    const template =
        await loadEntityTemplate();


    // --------------------------------------------------------
    // Create canvas.
    // --------------------------------------------------------

    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        template.naturalWidth ||
        ENTITY_PAN_CONFIG.canvas.width;


    canvas.height =
        template.naturalHeight ||
        ENTITY_PAN_CONFIG.canvas.height;


    const context =
        canvas.getContext(
            "2d"
        );


    if (!context) {

        throw new Error(
            "Unable to create Entity PAN canvas context."
        );
    }


    // ========================================================
    // 1. DRAW ORIGINAL TEMPLATE
    // ========================================================

    context.drawImage(
        template,
        0,
        0,
        canvas.width,
        canvas.height
    );


    // ========================================================
    // 2. DRAW ENTITY DATA
    // ========================================================

    renderEntityData(
        context,
        entityData,
        ENTITY_PAN_CONFIG
    );


    // ========================================================
    // 3. DRAW OPTIONAL ENTITY LOGO
    // ========================================================

    const entityImage =
        await loadEntityImage(
            entityData.image
        );


    if (entityImage) {

        drawEntityPhoto(
            context,
            entityImage,
            ENTITY_PAN_CONFIG.photo
        );
    }


    // ========================================================
    // RETURN COMPLETE DOCUMENT
    // ========================================================

    return canvas;
}


// ============================================================
// RENDER ENTITY PAN
//
// Copies generated Entity PAN into the canvas from index.html.
// ============================================================

async function renderEntityPAN(
    canvas,
    entityData = {}
) {

    if (!canvas) {

        throw new Error(
            "Entity preview canvas was not found."
        );
    }


    const renderedCanvas =
        await drawEntityPANDocument(
            entityData
        );


    // --------------------------------------------------------
    // Match template dimensions.
    // --------------------------------------------------------

    canvas.width =
        renderedCanvas.width;


    canvas.height =
        renderedCanvas.height;


    const context =
        canvas.getContext(
            "2d"
        );


    if (!context) {

        throw new Error(
            "Unable to create Entity preview canvas context."
        );
    }


    // --------------------------------------------------------
    // Clear previous preview.
    // --------------------------------------------------------

    context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // --------------------------------------------------------
    // Draw new Entity PAN.
    // --------------------------------------------------------

    context.drawImage(
        renderedCanvas,
        0,
        0
    );


    return canvas;
}


// ============================================================
// DEBUG COORDINATE PICKER
//
// Optional.
//
// Use from browser console:
//
//     enableEntityCoordinatePicker(
//         document.getElementById("entityCardCanvas")
//     );
//
// Then click on the canvas to see coordinates.
// ============================================================

function enableEntityCoordinatePicker(
    canvas
) {

    if (!canvas) {

        console.error(
            "Entity canvas not found."
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
                    ) *
                    scaleX
                );


            const y =
                Math.round(
                    (
                        event.clientY -
                        rect.top
                    ) *
                    scaleY
                );


            console.log(
                `Entity PAN coordinate -> X: ${x}, Y: ${y}`
            );
        }
    );


    console.log(
        "Entity PAN coordinate picker enabled."
    );
}


// ============================================================
// EXPOSE CONFIGURATION
//
// Useful for debugging from browser console.
// ============================================================

window.ENTITY_PAN_CONFIG =
    ENTITY_PAN_CONFIG;


// ============================================================
// OPTIONAL NODE.JS EXPORT
// ============================================================

if (
    typeof module !== "undefined" &&
    module.exports
) {

    module.exports = {

        ENTITY_PAN_TEMPLATE,

        ENTITY_PAN_CONFIG,

        renderEntityData,

        drawEntityPANDocument,

        renderEntityPAN
    };
}