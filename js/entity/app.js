// ============================================================
// FILE: app.js
//
// PURPOSE:
//     Entity application controller.
//
// CURRENT FLOW:
//     1. Enter Entity data manually
//     2. Randomize Entity data
//     3. Automatically generate Entity PAN preview
//     4. Generate Preview manually when required
//     5. Download generated Entity PAN
//     6. Clear Entity data
//
// IMPORTANT:
//     This file handles UI events and application flow only.
//
//     Data generation is handled by:
//         data-generator.js
//
//     Document rendering is handled by:
//         document-renderer.js
//
//     Image download is handled by:
//         image-export.js
// ============================================================


// ============================================================
// ENTITY APPLICATION STATE
// ============================================================

let entityPhotoSource = null;

let entityLastCanvas = null;


// ============================================================
// GET ENTITY UI ELEMENTS
//
// Centralized element lookup keeps the rest of this file clean.
// ============================================================

function getEntityElements() {

    return {

        // ----------------------------------------------------
        // Entity form fields
        // ----------------------------------------------------

        entityName:
            document.getElementById("entityName"),

        entityType:
            document.getElementById("entityType"),

        registrationNumber:
            document.getElementById(
                "entityRegistrationNumber"
            ),

        incorporationDate:
            document.getElementById(
                "entityIncorporationDate"
            ),

        pan:
            document.getElementById("entityPan"),

        address:
            document.getElementById("entityAddress"),

        photo:
            document.getElementById("entityPhoto"),


        // ----------------------------------------------------
        // Action buttons
        // ----------------------------------------------------

        generate:
            document.getElementById(
                "entityGenerateBtn"
            ),

        randomize:
            document.getElementById(
                "entityRandomizeBtn"
            ),

        clear:
            document.getElementById(
                "entityClearBtn"
            ),


        // ----------------------------------------------------
        // Status and download
        // ----------------------------------------------------

        status:
            document.getElementById(
                "entityStatus"
            ),

        download:
            document.getElementById(
                "entityDownloadBtn"
            ),


        // ----------------------------------------------------
        // Preview canvas
        //
        // Support both current and older canvas IDs.
        // ----------------------------------------------------

        canvas:
            document.getElementById(
                "entityCardCanvas"
            ) ||
            document.getElementById(
                "entityCanvas"
            ),

        emptyPreview:
            document.getElementById(
                "entityEmptyPreview"
            )

    };

}


// ============================================================
// SET ENTITY STATUS
//
// Displays success/info/error messages below the form.
// ============================================================

function setEntityStatus(
    message,
    isError = false
) {

    const elements =
        getEntityElements();


    if (!elements.status) {

        return;

    }


    elements.status.textContent =
        message;


    elements.status.style.color =
        isError
            ? "#b42318"
            : "#627282";

}


// ============================================================
// GET ENTITY FORM DATA
//
// Reads the current values from the Entity form.
// ============================================================

function getEntityFormData() {

    const elements =
        getEntityElements();


    return {

        entityName:
            elements.entityName?.value.trim() ||
            "",

        entityType:
            elements.entityType?.value.trim() ||
            "",

        registrationNumber:
            elements.registrationNumber?.value.trim() ||
            "",

        incorporationDate:
            elements.incorporationDate?.value.trim() ||
            "",

        pan:
            elements.pan?.value.trim() ||
            "",

        address:
            elements.address?.value.trim() ||
            "",

        image:
            entityPhotoSource

    };

}


// ============================================================
// RANDOMIZE ENTITY DATA
//
// Generates synthetic Entity information.
//
// IMPORTANT:
//     After generating the random data, the Entity PAN preview
//     is automatically generated.
//
//     This matches the existing Individual flow:
//
//         Randomize
//              ↓
//         Generate data
//              ↓
//         Update preview
// ============================================================

function randomizeEntityData() {

    const elements =
        getEntityElements();


    if (!elements.entityName) {

        return;

    }


    // ========================================================
    // GENERATE ENTITY TYPE FIRST
    //
    // PAN generation depends on Entity Type.
    // ========================================================

    const generatedType =
        generateEntityType();


    // ========================================================
    // GENERATE ENTITY FORM DATA
    // ========================================================

    elements.entityName.value =
        generateEntityName();


    elements.entityType.value =
        generatedType;


    elements.registrationNumber.value =
        generateRegistrationNumber();


    elements.incorporationDate.value =
        generateDateOfIncorporation();


    elements.pan.value =
        generateEntityPANNumber(
            generatedType
        );


    elements.address.value =
        generateEntityAddress();


    // ========================================================
    // UPDATE STATUS
    // ========================================================

    setEntityStatus(
        "Random Entity data generated."
    );


    // ========================================================
    // AUTOMATICALLY GENERATE PREVIEW
    //
    // This is the important change.
    //
    // Individual already behaves this way, so Entity now
    // follows the same flow.
    // ========================================================

    generateEntityPreview();

}


// ============================================================
// CLEAR ENTITY DATA
//
// Clears the form and removes the current preview.
// ============================================================

function clearEntityData() {

    const elements =
        getEntityElements();


    // ========================================================
    // CLEAR FORM VALUES
    // ========================================================

    if (elements.entityName) {

        elements.entityName.value = "";

    }


    if (elements.entityType) {

        elements.entityType.value = "";

    }


    if (elements.registrationNumber) {

        elements.registrationNumber.value = "";

    }


    if (elements.incorporationDate) {

        elements.incorporationDate.value = "";

    }


    if (elements.pan) {

        elements.pan.value = "";

    }


    if (elements.address) {

        elements.address.value = "";

    }


    if (elements.photo) {

        elements.photo.value = "";

    }


    // ========================================================
    // CLEAR APPLICATION STATE
    // ========================================================

    entityPhotoSource = null;

    entityLastCanvas = null;


    // ========================================================
    // CLEAR PREVIEW CANVAS
    // ========================================================

    if (elements.canvas) {

        const context =
            elements.canvas.getContext("2d");


        if (context) {

            context.clearRect(
                0,
                0,
                elements.canvas.width,
                elements.canvas.height
            );

        }


        elements.canvas.width = 0;

        elements.canvas.height = 0;

    }


    // ========================================================
    // SHOW EMPTY PREVIEW
    // ========================================================

    if (elements.emptyPreview) {

        elements.emptyPreview.style.display =
            "flex";

    }


    // ========================================================
    // DISABLE DOWNLOAD
    // ========================================================

    if (elements.download) {

        elements.download.disabled = true;

    }


    // ========================================================
    // CLEAR STATUS
    // ========================================================

    setEntityStatus("");

}


// ============================================================
// HANDLE ENTITY PHOTO CHANGE
//
// Validates and stores the optional Entity logo/image.
// ============================================================

function handleEntityPhotoChange(
    event
) {

    const file =
        event.target.files?.[0];


    if (!file) {

        entityPhotoSource = null;

        return;

    }


    // ========================================================
    // VALIDATE IMAGE
    // ========================================================

    if (!file.type.startsWith("image/")) {

        event.target.value = "";

        entityPhotoSource = null;

        setEntityStatus(
            "Please select an image file.",
            true
        );

        return;

    }


    // ========================================================
    // STORE IMAGE
    // ========================================================

    entityPhotoSource =
        file;


    setEntityStatus(
        `Photo selected: ${file.name}`
    );

}


// ============================================================
// VALIDATE ENTITY DATA
//
// Ensures all required Entity fields are present before
// generating the preview.
// ============================================================

function validateEntityData(
    entityData
) {

    if (!entityData.entityName) {

        return "Entity Name is required.";

    }


    if (!entityData.entityType) {

        return "Entity Type is required.";

    }


    if (!entityData.registrationNumber) {

        return "Registration Number is required.";

    }


    if (!entityData.incorporationDate) {

        return "Date of Incorporation is required.";

    }


    if (!entityData.pan) {

        return "PAN is required.";

    }


    // ========================================================
    // PAN FORMAT VALIDATION
    //
    // Synthetic test PAN:
    //     5 letters + 4 digits + 1 letter
    // ========================================================

    if (
        !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(
            entityData.pan
        )
    ) {

        return (
            "PAN must contain 10 characters " +
            "in the test format."
        );

    }


    if (!entityData.address) {

        return "Registered Address is required.";

    }


    return "";

}


// ============================================================
// GENERATE ENTITY PAN PREVIEW
//
// Sends the current Entity data to the renderer.
//
// Renderer:
//     js/entity/document-renderer.js
// ============================================================

async function generateEntityPreview() {

    const elements =
        getEntityElements();


    // ========================================================
    // CHECK PREVIEW CANVAS
    // ========================================================

    if (!elements.canvas) {

        setEntityStatus(
            "Entity preview canvas was not found. " +
            "Check the HTML canvas ID.",
            true
        );

        return;

    }


    // ========================================================
    // CHECK ENTITY RENDERER
    // ========================================================

    if (
        typeof renderEntityPAN !==
        "function"
    ) {

        setEntityStatus(
            "Entity renderer is not loaded. " +
            "Check script paths/order.",
            true
        );

        return;

    }


    // ========================================================
    // GET FORM DATA
    // ========================================================

    const entityData =
        getEntityFormData();


    // ========================================================
    // VALIDATE FORM DATA
    // ========================================================

    const validationMessage =
        validateEntityData(
            entityData
        );


    if (validationMessage) {

        setEntityStatus(
            validationMessage,
            true
        );

        return;

    }


    try {

        // ====================================================
        // SHOW GENERATION STATUS
        // ====================================================

        setEntityStatus(
            "Generating Entity PAN preview..."
        );


        // ====================================================
        // DISABLE GENERATE BUTTON
        // ====================================================

        if (elements.generate) {

            elements.generate.disabled =
                true;

        }


        // ====================================================
        // RENDER ENTITY PAN
        // ====================================================

        await renderEntityPAN(
            elements.canvas,
            entityData
        );


        // ====================================================
        // STORE LAST GENERATED CANVAS
        // ====================================================

        entityLastCanvas =
            elements.canvas;


        // ====================================================
        // HIDE EMPTY PREVIEW MESSAGE
        // ====================================================

        if (elements.emptyPreview) {

            elements.emptyPreview.style.display =
                "none";

        }


        // ====================================================
        // ENABLE DOWNLOAD
        // ====================================================

        if (elements.download) {

            elements.download.disabled =
                false;

        }


        // ====================================================
        // SUCCESS STATUS
        // ====================================================

        setEntityStatus(
            "Entity PAN preview generated successfully."
        );


    } catch (error) {

        // ====================================================
        // LOG ERROR
        // ====================================================

        console.error(
            "Entity PAN generation failed:",
            error
        );


        // ====================================================
        // SHOW ERROR
        // ====================================================

        setEntityStatus(
            error?.message ||
            "Unable to generate Entity PAN preview.",
            true
        );


    } finally {

        // ====================================================
        // ENABLE GENERATE BUTTON
        // ====================================================

        if (elements.generate) {

            elements.generate.disabled =
                false;

        }

    }

}


// ============================================================
// DOWNLOAD ENTITY PAN
//
// Downloads the currently generated Entity PAN as JPEG.
// ============================================================

function downloadEntityPAN() {

    const elements =
        getEntityElements();


    const canvas =
        entityLastCanvas ||
        elements.canvas;


    // ========================================================
    // CHECK GENERATED PREVIEW
    // ========================================================

    if (
        !canvas ||
        !canvas.width ||
        !canvas.height
    ) {

        setEntityStatus(
            "Generate the Entity PAN preview first.",
            true
        );

        return;

    }


    // ========================================================
    // USE SHARED IMAGE EXPORT
    // ========================================================

    if (
        typeof downloadCanvasAsJPEG ===
        "function"
    ) {

        downloadCanvasAsJPEG(
            canvas,
            "entity-pan-test-data.jpg"
        );


        setEntityStatus(
            "Entity PAN downloaded."
        );


        return;

    }


    // ========================================================
    // FALLBACK DOWNLOAD
    // ========================================================

    const link =
        document.createElement("a");


    link.download =
        "entity-pan-test-data.jpg";


    link.href =
        canvas.toDataURL(
            "image/jpeg",
            0.95
        );


    link.click();


    setEntityStatus(
        "Entity PAN downloaded."
    );

}


// ============================================================
// INITIALIZE ENTITY APPLICATION
//
// Registers all Entity UI event handlers.
// ============================================================

function initializeEntityApp() {

    const elements =
        getEntityElements();


    // ========================================================
    // ENTITY MODULE NOT PRESENT
    //
    // This allows Individual-only pages to load safely.
    // ========================================================

    if (!elements.entityName) {

        return;

    }


    // ========================================================
    // RANDOMIZE BUTTON
    //
    // Randomize now also generates the preview automatically.
    // ========================================================

    if (elements.randomize) {

        elements.randomize.addEventListener(
            "click",
            randomizeEntityData
        );

    }


    // ========================================================
    // CLEAR BUTTON
    // ========================================================

    if (elements.clear) {

        elements.clear.addEventListener(
            "click",
            clearEntityData
        );

    }


    // ========================================================
    // GENERATE PREVIEW BUTTON
    // ========================================================

    if (elements.generate) {

        elements.generate.addEventListener(
            "click",
            generateEntityPreview
        );

    }


    // ========================================================
    // DOWNLOAD BUTTON
    // ========================================================

    if (elements.download) {

        elements.download.addEventListener(
            "click",
            downloadEntityPAN
        );

    }


    // ========================================================
    // PHOTO INPUT
    // ========================================================

    if (elements.photo) {

        elements.photo.addEventListener(
            "change",
            handleEntityPhotoChange
        );

    }

}


// ============================================================
// APPLICATION STARTUP
// ============================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeEntityApp
    );

} else {

    initializeEntityApp();

}