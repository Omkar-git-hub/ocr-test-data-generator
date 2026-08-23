// ============================================================
// FILE: js/image-export.js
//
// PURPOSE:
//     Image export, JPEG compression and photo normalization
//     utilities for the OCR Test Data Generator.
//
// RESPONSIBILITIES:
//     1. Compress PAN / Aadhaar cards below 80 KB.
//     2. Convert uploaded photos to exactly 900 x 1200.
//     3. Compress generated photos below 80 KB.
//     4. Strictly reject any photo that remains >= 80 KB.
//     5. Provide download functionality for generated cards.
//
// USED BY:
//     js/app.js
//
// IMPORTANT SIZE RULES:
//
//     PAN / Aadhaar:
//         < 80 KB
//
//     Photos:
//         900 x 1200 pixels
//         < 80 KB
//
//     The application will NEVER silently add an oversized
//     photo to the generated ZIP.
// ============================================================


// ============================================================
// GLOBAL IMAGE EXPORT CONFIGURATION
// ============================================================

const IMAGE_EXPORT_CONFIG = {

    // --------------------------------------------------------
    // Maximum allowed file size.
    //
    // 80 * 1024 = 81,920 bytes.
    //
    // We use STRICTLY LESS THAN this value.
    // --------------------------------------------------------

    maxBytes: 80 * 1024,


    // --------------------------------------------------------
    // PAN / Aadhaar compression settings.
    // --------------------------------------------------------

    maxQuality: 0.88,

    minQuality: 0.35,

    qualityStep: 0.03,


    // --------------------------------------------------------
    // PAN / Aadhaar fallback scaling.
    //
    // Documents can be reduced slightly if JPEG quality
    // alone cannot reach the required file size.
    // --------------------------------------------------------

    scaleStep: 0.90,

    minScale: 0.60
};


// ============================================================
// PHOTO EXPORT CONFIGURATION
// ============================================================

const PHOTO_EXPORT_CONFIG = {

    // --------------------------------------------------------
    // REQUIRED PHOTO RESOLUTION
    // --------------------------------------------------------

    width: 900,

    height: 1200,


    // --------------------------------------------------------
    // Start with good JPEG quality.
    // Compression will automatically reduce quality until
    // the photo becomes smaller than 80 KB.
    // --------------------------------------------------------

    maxQuality: 0.88,

    minQuality: 0.20,

    qualityStep: 0.02,


    // --------------------------------------------------------
    // Maximum allowed photo size.
    //
    // IMPORTANT:
    // The photo must be STRICTLY LESS THAN this value.
    // --------------------------------------------------------

    maxBytes:
        80 * 1024
};


// ============================================================
// CONVERT CANVAS TO JPEG BLOB
// ============================================================

function canvasToJpgBlob(
    canvas,
    quality = 0.88
) {

    return new Promise(
        resolve => {

            canvas.toBlob(
                blob => {

                    resolve(blob);

                },
                "image/jpeg",
                quality
            );
        }
    );
}


// ============================================================
// CREATE SCALED CANVAS
//
// USED FOR:
//     PAN / Aadhaar compression.
//
// NOTE:
//     Photo resolution is NOT reduced here.
//     Photos always remain 900 x 1200.
// ============================================================

function createScaledCanvas(
    sourceCanvas,
    scale
) {

    const width =
        Math.max(
            1,
            Math.round(
                sourceCanvas.width *
                scale
            )
        );


    const height =
        Math.max(
            1,
            Math.round(
                sourceCanvas.height *
                scale
            )
        );


    const scaledCanvas =
        document.createElement(
            "canvas"
        );


    scaledCanvas.width =
        width;


    scaledCanvas.height =
        height;


    const ctx =
        scaledCanvas.getContext(
            "2d"
        );


    ctx.imageSmoothingEnabled =
        true;


    ctx.imageSmoothingQuality =
        "high";


    ctx.drawImage(
        sourceCanvas,
        0,
        0,
        width,
        height
    );


    return scaledCanvas;
}


// ============================================================
// COMPRESS PAN / AADHAAR CANVAS
//
// REQUIREMENT:
//     Generated document MUST be < 80 KB.
//
// PROCESS:
//     1. Try high JPEG quality.
//     2. Reduce quality gradually.
//     3. If still too large, reduce document dimensions.
//     4. Retry compression.
//     5. If still impossible, throw an error.
//
// RETURN:
//
//     {
//         blob,
//         size,
//         sizeKB,
//         quality,
//         scale,
//         width,
//         height
//     }
// ============================================================

async function compressCanvas(
    sourceCanvas
) {

    if (
        !sourceCanvas ||
        !sourceCanvas.width ||
        !sourceCanvas.height
    ) {

        throw new Error(
            "Invalid canvas supplied for compression."
        );
    }


    const maxBytes =
        IMAGE_EXPORT_CONFIG.maxBytes;


    let scale =
        1;


    let workingCanvas =
        sourceCanvas;


    // ========================================================
    // TRY DIFFERENT SCALES
    // ========================================================

    while (
        scale >=
        IMAGE_EXPORT_CONFIG.minScale
    ) {

        let quality =
            IMAGE_EXPORT_CONFIG.maxQuality;


        // ====================================================
        // TRY DIFFERENT JPEG QUALITIES
        // ====================================================

        while (
            quality >=
            IMAGE_EXPORT_CONFIG.minQuality
        ) {

            const blob =
                await canvasToJpgBlob(
                    workingCanvas,
                    quality
                );


            if (!blob) {

                throw new Error(
                    "Browser could not create JPEG."
                );
            }


            // =================================================
            // STRICT SIZE CHECK
            //
            // IMPORTANT:
            // Must be < 80 KB, NOT <= 80 KB.
            // =================================================

            if (
                blob.size <
                maxBytes
            ) {

                return {

                    blob,

                    size:
                        blob.size,

                    sizeKB:
                        blob.size / 1024,

                    quality,

                    scale,

                    width:
                        workingCanvas.width,

                    height:
                        workingCanvas.height
                };
            }


            quality -=
                IMAGE_EXPORT_CONFIG.qualityStep;
        }


        // ====================================================
        // Quality was not enough.
        //
        // Reduce PAN / Aadhaar dimensions and retry.
        // ====================================================

        scale *=
            IMAGE_EXPORT_CONFIG.scaleStep;


        if (
            scale <
            IMAGE_EXPORT_CONFIG.minScale
        ) {

            break;
        }


        workingCanvas =
            createScaledCanvas(
                sourceCanvas,
                scale
            );
    }


    // ========================================================
    // STRICT FAILURE
    //
    // Never return an oversized document.
    // ========================================================

    throw new Error(
        "Generated document could not be compressed below 80 KB."
    );
}


// ============================================================
// DOWNLOAD CANVAS
//
// PURPOSE:
//     Manual PAN / Aadhaar download.
//
//     Uses the same strict <80 KB compression used by ZIP.
// ============================================================

async function downloadCanvas(
    canvas,
    filename
) {

    const result =
        await compressCanvas(
            canvas
        );


    if (
        result.blob.size >=
        IMAGE_EXPORT_CONFIG.maxBytes
    ) {

        throw new Error(
            "Generated image is not below 80 KB."
        );
    }


    const url =
        URL.createObjectURL(
            result.blob
        );


    const anchor =
        document.createElement(
            "a"
        );


    anchor.href =
        url;


    anchor.download =
        filename;


    document.body.appendChild(
        anchor
    );


    anchor.click();


    anchor.remove();


    setTimeout(
        () => {

            URL.revokeObjectURL(
                url
            );

        },
        1000
    );


    return result;
}


// ============================================================
// LOAD IMAGE FROM DATA URL
// ============================================================

function loadImageFromDataUrl(
    dataUrl
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            if (!dataUrl) {

                reject(
                    new Error(
                        "Photo data is empty."
                    )
                );

                return;
            }


            const image =
                new Image();


            image.onload =
                () => {

                    if (
                        !image.naturalWidth ||
                        !image.naturalHeight
                    ) {

                        reject(
                            new Error(
                                "Photo has invalid dimensions."
                            )
                        );

                        return;
                    }


                    resolve(
                        image
                    );
                };


            image.onerror =
                () => {

                    reject(
                        new Error(
                            "Could not load uploaded photo."
                        )
                    );
                };


            image.src =
                dataUrl;
        }
    );
}


// ============================================================
// CREATE 900 x 1200 PHOTO CANVAS
//
// PURPOSE:
//     Normalize every uploaded photo to exactly:
//
//         WIDTH  = 900
//         HEIGHT = 1200
//
// BEHAVIOR:
//     - Keeps original aspect ratio.
//     - Uses cover/crop.
//     - Never stretches the photo.
//     - Uses high-quality image smoothing.
// ============================================================

async function createNormalizedPhotoCanvas(
    photoDataUrl
) {

    const image =
        await loadImageFromDataUrl(
            photoDataUrl
        );


    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        PHOTO_EXPORT_CONFIG.width;


    canvas.height =
        PHOTO_EXPORT_CONFIG.height;


    const ctx =
        canvas.getContext(
            "2d"
        );


    // ========================================================
    // WHITE BACKGROUND
    //
    // Useful when uploaded PNG contains transparency.
    // ========================================================

    ctx.fillStyle =
        "#ffffff";


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    const sourceWidth =
        image.naturalWidth;


    const sourceHeight =
        image.naturalHeight;


    const targetWidth =
        PHOTO_EXPORT_CONFIG.width;


    const targetHeight =
        PHOTO_EXPORT_CONFIG.height;


    const sourceRatio =
        sourceWidth /
        sourceHeight;


    const targetRatio =
        targetWidth /
        targetHeight;


    let drawWidth;

    let drawHeight;

    let drawX;

    let drawY;


    // ========================================================
    // COVER / CROP CALCULATION
    // ========================================================

    if (
        sourceRatio >
        targetRatio
    ) {

        // ----------------------------------------------------
        // Source is wider than 900:1200.
        //
        // Fit height and crop left/right.
        // ----------------------------------------------------

        drawHeight =
            targetHeight;


        drawWidth =
            targetHeight *
            sourceRatio;


        drawX =
            (
                targetWidth -
                drawWidth
            ) / 2;


        drawY =
            0;

    } else {

        // ----------------------------------------------------
        // Source is taller/narrower than 900:1200.
        //
        // Fit width and crop top/bottom.
        // ----------------------------------------------------

        drawWidth =
            targetWidth;


        drawHeight =
            targetWidth /
            sourceRatio;


        drawX =
            0;


        drawY =
            (
                targetHeight -
                drawHeight
            ) / 2;
    }


    // ========================================================
    // HIGH QUALITY IMAGE SCALING
    // ========================================================

    ctx.imageSmoothingEnabled =
        true;


    ctx.imageSmoothingQuality =
        "high";


    // ========================================================
    // DRAW NORMALIZED PHOTO
    // ========================================================

    ctx.drawImage(
        image,
        drawX,
        drawY,
        drawWidth,
        drawHeight
    );


    return canvas;
}


// ============================================================
// PREPARE PHOTO FOR ZIP
//
// FINAL PHOTO REQUIREMENTS:
//
//     Resolution:
//         900 x 1200
//
//     Format:
//         JPEG
//
//     Size:
//         STRICTLY < 80 KB
//
// IMPORTANT:
//     Unlike document compression, photo resolution is NEVER
//     reduced.
//
//     If the photo cannot reach <80 KB at 900x1200, this
//     function throws an error.
//
//     This prevents an oversized photo from entering ZIP.
// ============================================================

async function preparePhotoForZip(
    photoDataUrl
) {

    if (!photoDataUrl) {

        return null;
    }


    // ========================================================
    // CREATE EXACT 900 x 1200 CANVAS
    // ========================================================

    const canvas =
        await createNormalizedPhotoCanvas(
            photoDataUrl
        );


    // ========================================================
    // STRICT PHOTO SIZE
    // ========================================================

    const maxBytes =
        PHOTO_EXPORT_CONFIG.maxBytes;


    let quality =
        PHOTO_EXPORT_CONFIG.maxQuality;


    let lastBlob =
        null;


    // ========================================================
    // JPEG QUALITY LOOP
    //
    // Resolution stays exactly 900x1200.
    // ========================================================

    while (
        quality >=
        PHOTO_EXPORT_CONFIG.minQuality
    ) {

        const blob =
            await canvasToJpgBlob(
                canvas,
                quality
            );


        if (!blob) {

            throw new Error(
                "Could not create normalized photo JPEG."
            );
        }


        lastBlob =
            blob;


        // ====================================================
        // STRICT VALIDATION
        //
        // 80 KB is NOT accepted.
        //
        // Valid:
        //     79.99 KB
        //
        // Invalid:
        //     80.00 KB
        //     81 KB
        //     100 KB
        // ====================================================

        if (
            blob.size <
            maxBytes
        ) {

            // -----------------------------------------------
            // Final dimension validation
            // -----------------------------------------------

            if (
                canvas.width !== 900 ||
                canvas.height !== 1200
            ) {

                throw new Error(
                    "Photo resolution validation failed. " +
                    "Required resolution is exactly 900 x 1200."
                );
            }


            // -----------------------------------------------
            // Final size validation
            // -----------------------------------------------

            if (
                blob.size >=
                maxBytes
            ) {

                throw new Error(
                    "Photo size validation failed. " +
                    "Photo must be strictly below 80 KB."
                );
            }


            return blob;
        }


        // ----------------------------------------------------
        // Reduce JPEG quality.
        // ----------------------------------------------------

        quality -=
            PHOTO_EXPORT_CONFIG.qualityStep;
    }


    // ========================================================
    // STRICT FAILURE
    //
    // DO NOT return lastBlob.
    //
    // Returning lastBlob would allow an oversized photo
    // into the ZIP.
    // ========================================================

    const lastSizeKB =
        lastBlob
            ? (
                lastBlob.size /
                1024
            ).toFixed(1)
            : "unknown";


    throw new Error(
        "Photo size validation failed. " +
        `The normalized 900x1200 photo is still ${lastSizeKB} KB. ` +
        "The photo must be strictly below 80 KB."
    );
}


// ============================================================
// OPTIONAL PHOTO VALIDATION HELPER
//
// PURPOSE:
//     Can be used anywhere in the application to validate
//     an already-generated photo Blob.
//
// RETURNS:
//     true if:
//         - JPEG
//         - <80 KB
//
// Throws an error otherwise.
// ============================================================

function validatePhotoBlob(
    blob
) {

    if (!blob) {

        throw new Error(
            "Photo Blob is empty."
        );
    }


    if (
        blob.size >=
        PHOTO_EXPORT_CONFIG.maxBytes
    ) {

        throw new Error(
            "Photo must be strictly below 80 KB."
        );
    }


    if (
        blob.type &&
        blob.type !== "image/jpeg"
    ) {

        throw new Error(
            "Generated photo must be JPEG."
        );
    }


    return true;
}


// ============================================================
// EXPORT CONFIGURATION FOR DEBUGGING
//
// Useful from browser console:
//
//     PHOTO_EXPORT_CONFIG
//     IMAGE_EXPORT_CONFIG
//
// ============================================================