// ============================================================
// FILE: documents.js
//
// PURPOSE:
//     Central configuration for supported test documents.
//
// CURRENT DOCUMENTS:
//     1. PAN
//     2. Aadhaar
//     3. Entity PAN
//
// IMPORTANT:
//     This file only contains document configuration.
//     It does NOT generate data or render documents.
// ============================================================


const DOCUMENTS = {

    // ========================================================
    // INDIVIDUAL PAN
    // ========================================================

    PAN: {

        // Internal document identifier.
        id: "PAN",

        // Display name used by the UI.
        name: "PAN Test Card",

        // Category.
        mode: "individual",

        // Existing individual PAN template.
        template: "PAN_Template.png",

        // Fields supported by Individual PAN.
        fields: [
            "name",
            "fatherName",
            "dob",
            "gender",
            "number",
            "address",
            "photo"
        ]
    },


    // ========================================================
    // INDIVIDUAL AADHAAR
    // ========================================================

    Aadhaar: {

        // Internal document identifier.
        id: "Aadhaar",

        // Display name used by the UI.
        name: "Aadhaar Test Card",

        // Category.
        mode: "individual",

        // Existing Aadhaar template.
        template: "AADHAR_Template.png",

        // Fields supported by Individual Aadhaar.
        fields: [
            "name",
            "fatherName",
            "dob",
            "gender",
            "number",
            "address",
            "photo"
        ]
    },


    // ========================================================
    // ENTITY PAN
    // ========================================================

    EntityPAN: {

        // Internal document identifier.
        id: "EntityPAN",

        // Display name used by the UI.
        name: "Entity PAN Test Card",

        // Entity category.
        mode: "entity",

        /*
         * The Entity renderer currently uses the shared PAN
         * template:
         *
         * templates/individual/id/PAN_Template.png
         *
         * Therefore keep the template name aligned with the
         * existing PAN template.
         */
        template: "PAN_Template.png",

        // Fields supported by Entity PAN.
        fields: [
            "entityName",
            "entityType",
            "registrationNumber",
            "incorporationDate",
            "pan",
            "address",
            "image"
        ]
    }
};


// ============================================================
// HELPER FUNCTIONS
// ============================================================


/**
 * Get a document configuration by its ID.
 *
 * Example:
 *
 * getDocumentConfig("EntityPAN")
 *
 * @param {string} documentId
 * @returns {object|null}
 */
function getDocumentConfig(documentId) {

    return DOCUMENTS[documentId] || null;
}


/**
 * Get all documents belonging to a mode.
 *
 * Example:
 *
 * getDocumentsByMode("individual")
 *
 * returns:
 *     PAN
 *     Aadhaar
 *
 * Example:
 *
 * getDocumentsByMode("entity")
 *
 * returns:
 *     EntityPAN
 *
 * @param {string} mode
 * @returns {object[]}
 */
function getDocumentsByMode(mode) {

    return Object.values(DOCUMENTS)
        .filter(document => document.mode === mode);
}


/**
 * Get all supported document IDs.
 *
 * @returns {string[]}
 */
function getDocumentIds() {

    return Object.keys(DOCUMENTS);
}


// ============================================================
// OPTIONAL NODE.JS EXPORT
//
// This does not affect the browser application.
// ============================================================

if (
    typeof module !== "undefined" &&
    module.exports
) {

    module.exports = {
        DOCUMENTS,
        getDocumentConfig,
        getDocumentsByMode,
        getDocumentIds
    };
}