function loadPanTemplate() {

    const filePath =
        path.join(
            TEMPLATE_DIR,
            "individual",
            "id",
            "PAN_Template.png"
        );

    return fileToDataUrl(
        filePath
    );
}


function loadAadhaarTemplate() {

    const filePath =
        path.join(
            TEMPLATE_DIR,
            "individual",
            "id",
            "AADHAR_Template.png"
        );

    return fileToDataUrl(
        filePath
    );
}