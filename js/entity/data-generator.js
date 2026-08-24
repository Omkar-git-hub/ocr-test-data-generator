/* ============================================================
   ENTITY DATA GENERATOR
   Synthetic test data only.
   ============================================================ */

const ENTITY_TYPES = [
    "PRIVATE LIMITED",
    "LIMITED",
    "LLP",
    "PARTNERSHIP",
    "PROPRIETORSHIP"
];

const ENTITY_NAME_PARTS = [
    "ADVANCED", "PRIME", "NOVA", "APEX", "ORBIT",
    "SUMMIT", "BLUE", "URBAN", "GREEN", "GLOBAL",
    "NEXT", "EVEREST", "BRIGHT", "SMART", "ZENITH"
];

const ENTITY_NAME_SUFFIXES = [
    "INNOVATIONS", "INDUSTRIES", "SOLUTIONS", "TECHNOLOGIES",
    "ENTERPRISES", "SERVICES", "TRADERS", "SYSTEMS",
    "CONSULTANTS", "VENTURES"
];

const CITY_DATA = [
    ["MUMBAI", "MAHARASHTRA", "400001"],
    ["PUNE", "MAHARASHTRA", "411001"],
    ["DELHI", "DELHI", "110001"],
    ["BENGALURU", "KARNATAKA", "560001"],
    ["HYDERABAD", "TELANGANA", "500001"],
    ["CHENNAI", "TAMIL NADU", "600001"],
    ["AHMEDABAD", "GUJARAT", "380001"],
    ["KOLKATA", "WEST BENGAL", "700001"]
];

function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function randomDigits(length) {
    let value = "";
    for (let i = 0; i < length; i++) {
        value += Math.floor(Math.random() * 10);
    }
    return value;
}

function randomLetters(length) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let value = "";
    for (let i = 0; i < length; i++) {
        value += letters[Math.floor(Math.random() * letters.length)];
    }
    return value;
}

function generateEntityName() {
    return `${randomItem(ENTITY_NAME_PARTS)} ${randomItem(ENTITY_NAME_SUFFIXES)}`;
}

function generateEntityType() {
    return randomItem(ENTITY_TYPES);
}

function generateRegistrationNumber() {
    return `REG${new Date().getFullYear()}${randomDigits(7)}`;
}

function generateDateOfIncorporation() {
    const year = 1995 + Math.floor(Math.random() * 30);
    const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, "0");
    const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, "0");

    return `${day}/${month}/${year}`;
}

function getPanFourthCharacter(entityType) {
    switch (String(entityType || "").toUpperCase()) {
        case "PRIVATE LIMITED":
        case "LIMITED":
            return "C";
        case "PARTNERSHIP":
            return "F";
        case "LLP":
            return "F";
        case "PROPRIETORSHIP":
            return "P";
        default:
            return "C";
    }
}

function generateEntityPANNumber(entityType = "PRIVATE LIMITED") {
    const fourthCharacter = getPanFourthCharacter(entityType);

    /*
       Synthetic PAN format:
       5 letters + 4 digits + 1 letter.

       The fourth character is selected from the entity type
       to make test data structurally useful for OCR/automation.
    */
    return (
        randomLetters(3) +
        fourthCharacter +
        randomLetters(1) +
        randomDigits(4) +
        randomLetters(1)
    );
}

function generateEntityAddress() {
    const [city, state, pin] = randomItem(CITY_DATA);
    const streetNumber = 10 + Math.floor(Math.random() * 990);

    return `${streetNumber}, Commercial Street, ${city}, ${state} - ${pin}`;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        generateEntityName,
        generateEntityType,
        generateRegistrationNumber,
        generateDateOfIncorporation,
        generateEntityPANNumber,
        generateEntityAddress
    };
}
