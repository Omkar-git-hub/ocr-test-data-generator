// ============================================================
// FILE: js/image-export.js
//
// PURPOSE:
//     Export generated PAN / Aadhaar canvas images as JPEG.
//
// REQUIREMENT:
//     Final image MUST be below 80 KB.
//
// DESIGN:
//     - Preserve original resolution when possible.
//     - Prefer JPEG quality reduction first.
//     - If quality reduction is not enough, reduce resolution.
//     - Automatically find the best quality/size combination.
//     - PAN and Aadhaar are handled dynamically.
//
// OUTPUT:
//     JPEG
//     Target size: < 80 KB
// ============================================================


// ============================================================
// EXPORT CONFIGURATION
// ============================================================

const IMAGE_EXPORT_CONFIG = {

    // --------------------------------------------------------
    // HARD FILE SIZE LIMIT
    // --------------------------------------------------------

    maxBytes: 80 * 1024,


    // --------------------------------------------------------
    // JPEG QUALITY RANGE
    // --------------------------------------------------------

    maxQuality: 0.88,

    minQuality: 0.58,


    // --------------------------------------------------------
    // RESOLUTION RANGE
    //
    // Original resolution is always tried first.
    //
    // If the image is still too large, resolution is reduced.
    // --------------------------------------------------------

    maxScale: 1.00,

    minScale: 0.65,


    // --------------------------------------------------------
    // Resolution reduction step
    // --------------------------------------------------------

    scaleStep: 0.05
};


// ============================================================
// CANVAS -> JPEG BLOB
// ============================================================

function canvasToJpgBlob(
    canvas,
    quality
) {

    return new Promise(
        resolve => {

            canvas.toBlob(
                resolve,
                "image/jpeg",
                quality
            );

        }
    );
}


// ============================================================
// CREATE SCALED CANVAS
//
// IMPORTANT:
//     Original canvas is never modified.
//
//     A temporary canvas is created for compression.
// ============================================================

function createScaledCanvas(
    sourceCanvas,
    scale
) {

    const canvas =
        document.createElement("canvas");


    canvas.width =
        Math.max(
            1,
            Math.round(
                sourceCanvas.width * scale
            )
        );


    canvas.height =
        Math.max(
            1,
            Math.round(
                sourceCanvas.height * scale
            )
        );


    const ctx =
        canvas.getContext("2d");


    // --------------------------------------------------------
    // High quality image scaling
    // --------------------------------------------------------

    ctx.imageSmoothingEnabled =
        true;


    ctx.imageSmoothingQuality =
        "high";


    ctx.drawImage(
        sourceCanvas,
        0,
        0,
        canvas.width,
        canvas.height
    );


    return canvas;
}


// ============================================================
// FIND BEST JPEG
//
// Strategy:
//
//     scale 1.00
//         quality 0.88 -> 0.58
//
//     scale 0.95
//         quality 0.88 -> 0.58
//
//     scale 0.90
//         quality 0.88 -> 0.58
//
//     ...
//
// The FIRST valid result is returned.
//
// Therefore the highest possible resolution and quality
// are preserved while staying below 80 KB.
// ============================================================

async function compressCanvas(
    sourceCanvas
) {

    let scale =
        IMAGE_EXPORT_CONFIG.maxScale;


    let bestResult =
        null;


    while (
        scale >=
        IMAGE_EXPORT_CONFIG.minScale
    ) {

        // ----------------------------------------------------
        // Create temporary scaled canvas
        // ----------------------------------------------------

        const workingCanvas =
            createScaledCanvas(
                sourceCanvas,
                scale
            );


        // ----------------------------------------------------
        // Start from high JPEG quality
        // ----------------------------------------------------

        let quality =
            IMAGE_EXPORT_CONFIG.maxQuality;


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
                    "Unable to create JPEG image."
                );
            }


            const result = {

                blob: blob,

                quality: quality,

                scale: scale,

                width: workingCanvas.width,

                height: workingCanvas.height
            };


            // ------------------------------------------------
            // Keep the latest result as fallback
            // ------------------------------------------------

            bestResult =
                result;


            // ------------------------------------------------
            // SUCCESS
            //
            // Strictly less than 80 KB.
            // ------------------------------------------------

            if (
                blob.size <
                IMAGE_EXPORT_CONFIG.maxBytes
            ) {

                return result;
            }


            // ------------------------------------------------
            // Reduce quality
            // ------------------------------------------------

            quality =
                Number(
                    (
                        quality - 0.04
                    ).toFixed(2)
                );
        }


        // ----------------------------------------------------
        // Quality alone wasn't enough.
        //
        // Reduce resolution slightly and try again.
        // ----------------------------------------------------

        scale =
            Number(
                (
                    scale -
                    IMAGE_EXPORT_CONFIG.scaleStep
                ).toFixed(2)
            );
    }


    // ========================================================
    // FINAL FALLBACK
    //
    // This should rarely be reached.
    // ========================================================

    return bestResult;
}


// ============================================================
// DOWNLOAD CANVAS
// ============================================================

async function downloadCanvas(
    canvas,
    filename
) {

    try {

        // ----------------------------------------------------
        // Compress
        // ----------------------------------------------------

        const result =
            await compressCanvas(
                canvas
            );


        if (
            !result ||
            !result.blob
        ) {

            throw new Error(
                "JPEG generation failed."
            );
        }


        // ----------------------------------------------------
        // Verify size
        // ----------------------------------------------------

        const sizeBytes =
            result.blob.size;


        const sizeKB =
            (
                sizeBytes /
                1024
            ).toFixed(1);


        // ----------------------------------------------------
        // Safety check
        // ----------------------------------------------------

        if (
            sizeBytes >=
            IMAGE_EXPORT_CONFIG.maxBytes
        ) {

            console.error(
                `Unable to meet 80 KB limit. ` +
                `Generated size: ${sizeKB} KB`
            );

            throw new Error(
                `Unable to compress image below ` +
                `${IMAGE_EXPORT_CONFIG.maxBytes / 1024} KB.`
            );
        }


        // ----------------------------------------------------
        // Create download URL
        // ----------------------------------------------------

        const url =
            URL.createObjectURL(
                result.blob
            );


        const link =
            document.createElement("a");


        link.href =
            url;


        link.download =
            filename;


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        // ----------------------------------------------------
        // Release object URL
        // ----------------------------------------------------

        setTimeout(
            () => {

                URL.revokeObjectURL(
                    url
                );

            },
            1000
        );


        // ----------------------------------------------------
        // Debug information
        // ----------------------------------------------------

        console.log(
            "========================================"
        );


        console.log(
            "OCR IMAGE EXPORT"
        );


        console.log(
            "========================================"
        );


        console.log(
            `File: ${filename}`
        );


        console.log(
            `Size: ${sizeKB} KB`
        );


        console.log(
            `Quality: ${result.quality}`
        );


        console.log(
            `Scale: ${result.scale}`
        );


        console.log(
            `Resolution: ` +
            `${result.width}x${result.height}`
        );


        console.log(
            "========================================"
        );


        return {

            blob:
                result.blob,

            sizeBytes:
                sizeBytes,

            sizeKB:
                Number(sizeKB),

            quality:
                result.quality,

            scale:
                result.scale,

            width:
                result.width,

            height:
                result.height
        };

    } catch (error) {

        console.error(
            "Image export failed:",
            error
        );

        throw error;
    }
}