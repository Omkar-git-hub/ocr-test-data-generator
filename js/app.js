// ============================================================
// FILE: js/app.js
//
// PURPOSE:
//     Main application controller for the synthetic PAN /
//     Aadhaar OCR test data generator.
//
// RESPONSIBILITIES:
//     1. Manual data generation.
//     2. Manual document preview.
//     3. Manual JPEG download.
//     4. Excel batch processing.
//     5. Bulk photo management.
//     6. PAN / Aadhaar ZIP generation.
//     7. Combined PAN + Aadhaar ZIP generation.
//     8. Use the common image compression logic so that
//        generated JPEG files stay below 80 KB.
//
// IMPORTANT:
//     document-renderer.js
//         -> creates the document canvas.
//
//     image-export.js
//         -> compresses the canvas to the required JPEG size.
//
//     app.js
//         -> controls the application and ZIP generation.
//
//     No document rendering logic is duplicated here.
// ============================================================


document.addEventListener(
    "DOMContentLoaded",
    () => {

        // ====================================================
        // DOM REFERENCES
        // ====================================================

        const $ = id =>
            document.getElementById(id);


        const modeManualBtn =
            $("modeManualBtn");

        const modeBatchBtn =
            $("modeBatchBtn");

        const manualSection =
            $("manualSection");

        const batchSection =
            $("batchSection");


        const docTypeSelect =
            $("docType");

        const inputName =
            $("inputName");

        const inputFather =
            $("inputFather");

        const inputDob =
            $("inputDob");

        const inputGender =
            $("inputGender");

        const inputNumber =
            $("inputNumber");

        const inputAddress =
            $("inputAddress");

        const photoInput =
            $("photoInput");


        const generateBtn =
            $("generateBtn");

        const randomizeBtn =
            $("randomizeBtn");

        const clearBtn =
            $("clearBtn");

        const downloadCardBtn =
            $("downloadCardBtn");

        const canvas =
            $("cardCanvas");

        const emptyPreview =
            $("emptyPreview");

        const manualStatus =
            $("manualStatus");


        const uploadExcelTrigger =
            $("uploadExcelTrigger");

        const excelUpload =
            $("excelUpload");

        const excelFileName =
            $("excelFileName");

        const downloadTemplateBtn =
            $("downloadTemplateBtn");

        const bulkPhotoUpload =
            $("bulkPhotoUpload");

        const bulkZipUpload =
            $("bulkZipUpload");

        const clearPhotosBtn =
            $("clearPhotosBtn");

        const photoUploadStatus =
            $("photoUploadStatus");


        const batchStatus =
            $("batchStatus");

        const recordCount =
            $("recordCount");

        const matchedCount =
            $("matchedCount");

        const missingCount =
            $("missingCount");

        const batchTableBody =
            $("batchTableBody");

        const downloadAllPan =
            $("downloadAllPan");

        const downloadAllAadhaar =
            $("downloadAllAadhaar");

        const downloadBothZip =
            $("downloadBothZip");


        // ====================================================
        // APPLICATION STATE
        // ====================================================

        let currentPhotoDataUrl = null;

        let hasGeneratedManual = false;

        let parsedRecords = [];

        let bulkPhotos = {};


        // ====================================================
        // LOAD PHOTOS PROVIDED BY STREAMLIT
        // ====================================================

        if (
            window.BULK_PHOTOS &&
            typeof window.BULK_PHOTOS === "object"
        ) {

            bulkPhotos = {
                ...window.BULK_PHOTOS
            };
        }


        // ====================================================
        // IMAGE EXPORT CONFIGURATION
        // ====================================================

        const MAX_IMAGE_BYTES =
            80 * 1024;


        // ====================================================
        // NORMALIZE PHOTO FILE NAME
        // ====================================================

        const normalizeFileName =
            value =>
                String(value || "")
                    .trim()
                    .replace(/\\/g, "/")
                    .split("/")
                    .pop()
                    .toLowerCase();


        // ====================================================
        // FIND BULK PHOTO
        // ====================================================

        function findBulkPhoto(
            photoValue,
            name
        ) {

            const requested =
                normalizeFileName(
                    photoValue
                );


            const keys =
                Object.keys(
                    bulkPhotos
                );


            // ------------------------------------------------
            // Match using Photo column
            // ------------------------------------------------

            if (requested) {

                const key =
                    keys.find(
                        item =>
                            normalizeFileName(item) ===
                            requested
                    );


                if (key) {

                    return {

                        dataUrl:
                            bulkPhotos[key],

                        filename:
                            key,

                        reason:
                            "Matched Photo column"
                    };
                }
            }


            // ------------------------------------------------
            // Fallback: match using person name
            // ------------------------------------------------

            const normalizedName =
                String(name || "")
                    .toLowerCase()
                    .replace(
                        /\.[^/.]+$/,
                        ""
                    )
                    .replace(
                        /[^a-z0-9]/g,
                        ""
                    );


            if (normalizedName) {

                const key =
                    keys.find(
                        item =>
                            String(item)
                                .toLowerCase()
                                .replace(
                                    /\.[^/.]+$/,
                                    ""
                                )
                                .replace(
                                    /[^a-z0-9]/g,
                                    ""
                                ) ===
                            normalizedName
                    );


                if (key) {

                    return {

                        dataUrl:
                            bulkPhotos[key],

                        filename:
                            key,

                        reason:
                            "Matched person name"
                    };
                }
            }


            // ------------------------------------------------
            // No photo found
            // ------------------------------------------------

            return {

                dataUrl:
                    null,

                filename:
                    requested,

                reason:
                    requested
                        ? "Photo not found"
                        : "No photo specified"
            };
        }


        // ====================================================
        // MODE SWITCHING
        // ====================================================

        function setMode(batch) {

            manualSection.style.display =
                batch
                    ? "none"
                    : "block";


            batchSection.style.display =
                batch
                    ? "block"
                    : "none";


            modeBatchBtn.classList.toggle(
                "secondary",
                !batch
            );


            modeManualBtn.classList.toggle(
                "secondary",
                batch
            );
        }


        modeManualBtn.onclick =
            () => setMode(false);


        modeBatchBtn.onclick =
            () => setMode(true);


        // ====================================================
        // MANUAL PHOTO INPUT
        // ====================================================

        photoInput.onchange =
            event => {

                const file =
                    event.target.files[0];


                if (!file) {

                    currentPhotoDataUrl =
                        null;

                    return;
                }


                const reader =
                    new FileReader();


                reader.onload =
                    event => {

                        currentPhotoDataUrl =
                            event.target.result;


                        if (
                            hasGeneratedManual
                        ) {

                            renderManual();
                        }
                    };


                reader.readAsDataURL(
                    file
                );
            };


        // ====================================================
        // BUILD MANUAL PERSON DATA
        // ====================================================

        function manualPerson() {

            const type =
                docTypeSelect.value;


            const number =
                inputNumber.value.trim();


            return {

                name:
                    inputName.value.trim(),

                parentName:
                    inputFather.value.trim(),

                dob:
                    inputDob.value.trim(),

                gender:
                    inputGender.value,

                pan:
                    type === "PAN"
                        ? (
                            number ||
                            generatePANNumber()
                        )
                        : "",

                aadhaar:
                    type === "Aadhaar"
                        ? (
                            number ||
                            generateAadharNumber()
                        )
                        : "",

                address:
                    inputAddress.value.trim()
            };
        }


        // ====================================================
        // RENDER MANUAL DOCUMENT
        // ====================================================

        async function renderManual() {

            const person =
                manualPerson();


            if (
                !person.name &&
                !person.parentName &&
                !person.dob &&
                !person.address &&
                !inputNumber.value &&
                !currentPhotoDataUrl
            ) {

                canvas
                    .getContext("2d")
                    .clearRect(
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );


                emptyPreview.style.display =
                    "block";


                downloadCardBtn.disabled =
                    true;


                return;
            }


            emptyPreview.style.display =
                "none";


            await drawSyntheticDocument(
                canvas,
                person,
                docTypeSelect.value,
                currentPhotoDataUrl
            );


            downloadCardBtn.disabled =
                false;
        }


        // ====================================================
        // MANUAL GENERATE
        // ====================================================

        generateBtn.onclick =
            async () => {

                if (
                    !inputName.value.trim()
                ) {

                    manualStatus.textContent =
                        "Enter at least a name before generating.";

                    return;
                }


                hasGeneratedManual =
                    true;


                await renderManual();


                manualStatus.textContent =
                    "Synthetic test document generated.";
            };


        // ====================================================
        // RANDOMIZE MANUAL DATA
        // ====================================================

        randomizeBtn.onclick =
            async () => {

                inputName.value =
                    generateRandomName();


                inputFather.value =
                    generateRandomFatherName();


                inputDob.value =
                    generateRandomDOB();


                inputGender.value =
                    generateRandomGender();


                inputNumber.value =
                    "";


                inputAddress.value =
                    generateRandomAddress();


                hasGeneratedManual =
                    true;


                await renderManual();


                manualStatus.textContent =
                    "Random synthetic test data generated.";
            };


        // ====================================================
        // CLEAR MANUAL DATA
        // ====================================================

        clearBtn.onclick =
            () => {

                inputName.value = "";

                inputFather.value = "";

                inputDob.value = "";

                inputGender.value = "";

                inputNumber.value = "";

                inputAddress.value = "";

                photoInput.value = "";

                currentPhotoDataUrl =
                    null;

                hasGeneratedManual =
                    false;

                manualStatus.textContent =
                    "";


                canvas
                    .getContext("2d")
                    .clearRect(
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );


                emptyPreview.style.display =
                    "block";


                downloadCardBtn.disabled =
                    true;
            };


        // ====================================================
        // LIVE MANUAL PREVIEW
        // ====================================================

        [
            docTypeSelect,
            inputName,
            inputFather,
            inputDob,
            inputGender,
            inputNumber,
            inputAddress
        ].forEach(
            element => {

                element.addEventListener(
                    "input",
                    () => {

                        if (
                            hasGeneratedManual
                        ) {

                            renderManual();
                        }
                    }
                );
            }
        );


        // ====================================================
        // COMPRESS CANVAS FOR EXPORT
        //
        // Uses compressCanvas() from image-export.js.
        //
        // This is the IMPORTANT FIX.
        //
        // Batch ZIP generation must NOT use:
        //
        //     canvas.toDataURL("image/jpeg", .92)
        //
        // because that bypasses the 80 KB compressor.
        // ====================================================

        async function getCompressedImageBlob(
            sourceCanvas
        ) {

            // ------------------------------------------------
            // image-export.js must be loaded before app.js.
            // ------------------------------------------------

            if (
                typeof compressCanvas !==
                "function"
            ) {

                throw new Error(
                    "Image compression module is not available."
                );
            }


            const result =
                await compressCanvas(
                    sourceCanvas
                );


            if (
                !result ||
                !result.blob
            ) {

                throw new Error(
                    "Could not create compressed JPEG."
                );
            }


            // ------------------------------------------------
            // Strict 80 KB validation
            // ------------------------------------------------

            if (
                result.blob.size >=
                MAX_IMAGE_BYTES
            ) {

                throw new Error(
                    `Generated image is ` +
                    `${(
                        result.blob.size /
                        1024
                    ).toFixed(1)} KB, ` +
                    `which exceeds the 80 KB limit.`
                );
            }


            return result;
        }


        // ====================================================
        // MANUAL DOWNLOAD
        //
        // FIX:
        //     Previously this used canvas.toDataURL(.92).
        //
        //     It now uses the same compression pipeline as
        //     batch ZIP generation.
        // ====================================================

        downloadCardBtn.onclick =
            async () => {

                if (
                    !canvas.width ||
                    !canvas.height
                ) {

                    return;
                }


                try {

                    downloadCardBtn.disabled =
                        true;


                    manualStatus.textContent =
                        "Optimizing image size...";


                    const result =
                        await getCompressedImageBlob(
                            canvas
                        );


                    const url =
                        URL.createObjectURL(
                            result.blob
                        );


                    const link =
                        document.createElement("a");


                    link.href =
                        url;


                    link.download =
                        `synthetic_${docTypeSelect.value}_${Date.now()}.jpg`;


                    document.body.appendChild(
                        link
                    );


                    link.click();


                    link.remove();


                    setTimeout(
                        () => {

                            URL.revokeObjectURL(
                                url
                            );

                        },
                        1000
                    );


                    manualStatus.textContent =
                        `JPEG ready: ` +
                        `${(
                            result.blob.size /
                            1024
                        ).toFixed(1)} KB`;

                } catch (error) {

                    console.error(
                        "Manual image export failed:",
                        error
                    );


                    manualStatus.textContent =
                        error.message ||
                        "Could not export image.";

                } finally {

                    downloadCardBtn.disabled =
                        false;
                }
            };


        // ====================================================
        // BULK PHOTO MANAGEMENT
        // ====================================================

        function registerPhoto(
            fileName,
            dataUrl
        ) {

            bulkPhotos[fileName] =
                dataUrl;
        }


        async function readImageFile(
            file
        ) {

            return new Promise(
                (
                    resolve,
                    reject
                ) => {

                    const reader =
                        new FileReader();


                    reader.onload =
                        event =>
                            resolve(
                                event.target.result
                            );


                    reader.onerror =
                        reject;


                    reader.readAsDataURL(
                        file
                    );
                }
            );
        }


        // ====================================================
        // LOAD MULTIPLE PHOTO FILES
        // ====================================================

        async function loadPhotoFiles(
            files
        ) {

            let count =
                0;


            for (
                const file of
                Array.from(files || [])
            ) {

                if (
                    !file.type.startsWith(
                        "image/"
                    )
                ) {

                    continue;
                }


                registerPhoto(
                    file.name,
                    await readImageFile(file)
                );


                count++;
            }


            photoUploadStatus.textContent =
                `${count} image(s) added. ` +
                `${Object.keys(bulkPhotos).length} ` +
                `total available.`;
        }


        bulkPhotoUpload.onchange =
            async event => {

                await loadPhotoFiles(
                    event.target.files
                );


                if (
                    parsedRecords.length
                ) {

                    relinkPhotos();
                }
            };


        // ====================================================
        // LOAD PHOTOS FROM ZIP
        // ====================================================

        bulkZipUpload.onchange =
            async event => {

                const file =
                    event.target.files[0];


                if (!file) {

                    return;
                }


                try {

                    const zip =
                        await JSZip.loadAsync(
                            file
                        );


                    let count =
                        0;


                    for (
                        const [
                            name,
                            entry
                        ] of
                        Object.entries(zip.files)
                    ) {

                        if (
                            entry.dir ||
                            !(
                                /\.(jpe?g|png|webp|gif)$/i
                            ).test(name)
                        ) {

                            continue;
                        }


                        const blob =
                            await entry.async(
                                "blob"
                            );


                        const dataUrl =
                            await readImageFile(
                                new File(
                                    [
                                        blob
                                    ],
                                    name,
                                    {
                                        type:
                                            blob.type ||
                                            "image/jpeg"
                                    }
                                )
                            );


                        registerPhoto(
                            name.split("/").pop(),
                            dataUrl
                        );


                        count++;
                    }


                    photoUploadStatus.textContent =
                        `${count} image(s) extracted. ` +
                        `${Object.keys(bulkPhotos).length} ` +
                        `total available.`;


                    if (
                        parsedRecords.length
                    ) {

                        relinkPhotos();
                    }

                } catch (error) {

                    photoUploadStatus.textContent =
                        "Could not read the ZIP file.";


                    console.error(
                        error
                    );
                }
            };


        // ====================================================
        // CLEAR UPLOADED PHOTOS
        // ====================================================

        clearPhotosBtn.onclick =
            () => {

                bulkPhotos = {};


                if (
                    window.BULK_PHOTOS
                ) {

                    bulkPhotos = {
                        ...window.BULK_PHOTOS
                    };
                }


                bulkPhotoUpload.value =
                    "";

                bulkZipUpload.value =
                    "";


                photoUploadStatus.textContent =
                    "Uploaded photos cleared.";


                if (
                    parsedRecords.length
                ) {

                    relinkPhotos();
                }
            };


        // ====================================================
        // RELINK PHOTOS TO RECORDS
        // ====================================================

        function relinkPhotos() {

            parsedRecords.forEach(
                record => {

                    const match =
                        findBulkPhoto(
                            record.photo,
                            record.name
                        );


                    record.photoDataUrl =
                        match.dataUrl;


                    record.photoFilename =
                        match.filename;


                    record.photoMatchReason =
                        match.reason;
                }
            );


            renderBatchTable();

            updateSummary();
        }


        // ====================================================
        // EXCEL UPLOAD
        // ====================================================

        uploadExcelTrigger.onclick =
            () =>
                excelUpload.click();


        // ====================================================
        // EXCEL VALUE HELPER
        // ====================================================

        function valueFromRow(
            row,
            keys
        ) {

            for (
                const key of keys
            ) {

                if (
                    row[key] !== undefined &&
                    String(row[key]).trim() !== ""
                ) {

                    return row[key];
                }
            }


            return "";
        }


        // ====================================================
        // DOWNLOAD SAMPLE EXCEL TEMPLATE
        // ====================================================

        downloadTemplateBtn.onclick =
            event => {

                event.preventDefault();


                const data = [

                    [
                        "Name",
                        "DOB",
                        "Gender",
                        "Address",
                        "ParentName",
                        "Photo",
                        "PAN",
                        "Aadhaar"
                    ],

                    [
                        "TEST PERSON ONE",
                        "15/06/1995",
                        "Male",
                        "12 Park Street, Mumbai, Maharashtra - 400001",
                        "TEST PARENT ONE",
                        "person1.jpg",
                        "",
                        ""
                    ],

                    [
                        "TEST PERSON TWO",
                        "22/11/1998",
                        "Female",
                        "45 MG Road, Bengaluru, Karnataka - 560001",
                        "TEST PARENT TWO",
                        "person2.jpg",
                        "",
                        ""
                    ],

                    [
                        "TEST PERSON THREE",
                        "10/04/1997",
                        "Male",
                        "78 Main Road, Pune, Maharashtra - 411001",
                        "TEST PARENT THREE",
                        "person3.jpg",
                        "",
                        "1234 5678 9012"
                    ]
                ];


                const workbook =
                    XLSX.utils.book_new();


                const worksheet =
                    XLSX.utils.aoa_to_sheet(
                        data
                    );


                worksheet["!cols"] = [

                    {
                        wch: 22
                    },

                    {
                        wch: 14
                    },

                    {
                        wch: 12
                    },

                    {
                        wch: 52
                    },

                    {
                        wch: 24
                    },

                    {
                        wch: 22
                    },

                    {
                        wch: 16
                    },

                    {
                        wch: 18
                    }
                ];


                XLSX.utils.book_append_sheet(
                    workbook,
                    worksheet,
                    "Template"
                );


                XLSX.writeFile(
                    workbook,
                    "ocr-test-data-template.xlsx"
                );
            };


        // ====================================================
        // EXCEL PROCESSING
        // ====================================================

        excelUpload.onchange =
            event => {

                const file =
                    event.target.files[0];


                if (!file) {

                    return;
                }


                excelFileName.textContent =
                    file.name;


                batchStatus.textContent =
                    "Reading Excel...";


                const reader =
                    new FileReader();


                reader.onload =
                    event => {

                        try {

                            const workbook =
                                XLSX.read(
                                    new Uint8Array(
                                        event.target.result
                                    ),
                                    {
                                        type:
                                            "array"
                                    }
                                );


                            const worksheet =
                                workbook.Sheets[
                                    workbook.SheetNames[0]
                                ];


                            const rows =
                                XLSX.utils.sheet_to_json(
                                    worksheet,
                                    {
                                        defval:
                                            ""
                                    }
                                );


                            if (
                                !rows.length
                            ) {

                                batchStatus.textContent =
                                    "Excel file is empty.";

                                return;
                            }


                            parsedRecords =
                                rows.map(
                                    (
                                        row,
                                        index
                                    ) => {

                                        const name =
                                            String(
                                                valueFromRow(
                                                    row,
                                                    [
                                                        "Name",
                                                        "NAME",
                                                        "name"
                                                    ]
                                                ) ||
                                                generateRandomName()
                                            )
                                                .trim()
                                                .toUpperCase();


                                        const photo =
                                            String(
                                                valueFromRow(
                                                    row,
                                                    [
                                                        "Photo",
                                                        "PHOTO",
                                                        "photo"
                                                    ]
                                                )
                                            ).trim();


                                        const match =
                                            findBulkPhoto(
                                                photo,
                                                name
                                            );


                                        const panInput =
                                            String(
                                                valueFromRow(
                                                    row,
                                                    [
                                                        "PAN",
                                                        "Pan",
                                                        "pan"
                                                    ]
                                                )
                                            ).trim();


                                        const aadhaarInput =
                                            String(
                                                valueFromRow(
                                                    row,
                                                    [
                                                        "Aadhaar",
                                                        "AADHAAR",
                                                        "Aadhar",
                                                        "AADHAR",
                                                        "aadhaar"
                                                    ]
                                                )
                                            ).trim();


                                        return {

                                            rowNumber:
                                                index + 2,

                                            name,

                                            dob:
                                                normalizeDate(
                                                    valueFromRow(
                                                        row,
                                                        [
                                                            "DOB",
                                                            "dob"
                                                        ]
                                                    ) ||
                                                    generateRandomDOB()
                                                ),

                                            gender:
                                                String(
                                                    valueFromRow(
                                                        row,
                                                        [
                                                            "Gender",
                                                            "GENDER",
                                                            "gender"
                                                        ]
                                                    ) ||
                                                    generateRandomGender()
                                                ).trim(),

                                            address:
                                                String(
                                                    valueFromRow(
                                                        row,
                                                        [
                                                            "Address",
                                                            "ADDRESS",
                                                            "address"
                                                        ]
                                                    ) ||
                                                    generateRandomAddress()
                                                ).trim(),

                                            parentName:
                                                String(
                                                    valueFromRow(
                                                        row,
                                                        [
                                                            "ParentName",
                                                            "PARENTNAME",
                                                            "FatherName",
                                                            "Father's Name"
                                                        ]
                                                    ) ||
                                                    generateRandomFatherName()
                                                )
                                                    .trim()
                                                    .toUpperCase(),

                                            photo,

                                            photoDataUrl:
                                                match.dataUrl,

                                            photoFilename:
                                                match.filename,

                                            photoMatchReason:
                                                match.reason,

                                            // ------------------------------------------------
                                            // User-provided PAN is used when present.
                                            // Otherwise synthetic PAN is generated.
                                            // ------------------------------------------------

                                            pan:
                                                panInput ||
                                                generatePANNumber(),

                                            // ------------------------------------------------
                                            // User-provided Aadhaar is used when present.
                                            // Otherwise synthetic Aadhaar is generated.
                                            // ------------------------------------------------

                                            aadhaar:
                                                aadhaarInput ||
                                                generateAadharNumber()
                                        };
                                    }
                                );


                            renderBatchTable();

                            updateSummary();

                            batchStatus.textContent =
                                `Parsed ${parsedRecords.length} record(s).`;


                            setBatchButtons();

                        } catch (error) {

                            console.error(
                                error
                            );


                            batchStatus.textContent =
                                "Could not parse Excel. Check the headers and file format.";
                        }
                    };


                reader.readAsArrayBuffer(
                    file
                );
            };


        // ====================================================
        // UPDATE BATCH SUMMARY
        // ====================================================

        function updateSummary() {

            recordCount.textContent =
                parsedRecords.length;


            const matched =
                parsedRecords.filter(
                    record =>
                        !!record.photoDataUrl
                ).length;


            matchedCount.textContent =
                matched;


            missingCount.textContent =
                parsedRecords.length -
                matched;
        }


        // ====================================================
        // ENABLE / DISABLE BATCH BUTTONS
        // ====================================================

        function setBatchButtons() {

            const disabled =
                parsedRecords.length === 0;


            downloadAllPan.disabled =
                disabled;


            downloadAllAadhaar.disabled =
                disabled;


            downloadBothZip.disabled =
                disabled;
        }


        // ====================================================
        // HTML ESCAPING
        // ====================================================

        function escapeHtml(value) {

            return String(
                value ?? ""
            )
                .replace(
                    /&/g,
                    "&amp;"
                )
                .replace(
                    /</g,
                    "&lt;"
                )
                .replace(
                    />/g,
                    "&gt;"
                )
                .replace(
                    /"/g,
                    "&quot;"
                )
                .replace(
                    /'/g,
                    "&#039;"
                );
        }


        // ====================================================
        // RENDER BATCH TABLE
        // ====================================================

        function renderBatchTable() {

            recordCount.textContent =
                parsedRecords.length;


            if (
                !parsedRecords.length
            ) {

                batchTableBody.innerHTML =
                    `
                    <tr>
                        <td
                            colspan="8"
                            class="empty-cell"
                        >
                            No Excel file uploaded yet.
                        </td>
                    </tr>
                    `;

                return;
            }


            batchTableBody.innerHTML =
                parsedRecords
                    .map(
                        (
                            record,
                            index
                        ) => {

                            const photo =
                                record.photoDataUrl

                                    ? `
                                    <div class="photo-cell">

                                        <img
                                            class="batch-photo"
                                            src="${record.photoDataUrl}"
                                            alt=""
                                        >

                                        <small>
                                            ${escapeHtml(
                                                record.photoFilename ||
                                                record.photo
                                            )}
                                        </small>

                                        <span
                                            class="table-status-ok"
                                        >
                                            ✓ matched
                                        </span>

                                    </div>
                                    `

                                    : `
                                    <div class="photo-cell">

                                        <div
                                            class="photo-missing"
                                        >
                                            Missing
                                        </div>

                                        <small>
                                            ${escapeHtml(
                                                record.photo ||
                                                "Not specified"
                                            )}
                                        </small>

                                        <span
                                            class="table-status-missing"
                                        >
                                            ✗ missing
                                        </span>

                                    </div>
                                    `;


                            return `
                            <tr>

                                <td>
                                    ${index + 1}
                                </td>

                                <td>
                                    ${photo}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        record.name
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        record.dob
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        record.gender
                                    )}
                                </td>

                                <td>
                                    <code>
                                        ${escapeHtml(
                                            record.pan
                                        )}
                                    </code>
                                </td>

                                <td>
                                    <code>
                                        ${escapeHtml(
                                            record.aadhaar
                                        )}
                                    </code>
                                </td>

                                <td>
                                    ${escapeHtml(
                                        record.address
                                    )}
                                </td>

                            </tr>
                            `;
                        }
                    )
                    .join("");
        }


        // ====================================================
        // GENERATE PAN / AADHAAR ZIP
        //
        // IMPORTANT:
        //     The previous implementation used:
        //
        //     temp.toDataURL("image/jpeg", .92)
        //
        //     That produced the 146-157 KB Aadhaar files.
        //
        //     This version uses getCompressedImageBlob()
        //     so every image is checked against the 80 KB limit.
        // ====================================================

        async function generateZipArchive(
            type
        ) {

            if (
                !parsedRecords.length
            ) {

                batchStatus.textContent =
                    "No records available.";

                return;
            }


            const zip =
                new JSZip();


            const folder =
                zip.folder(
                    type === "PAN"
                        ? "PAN_Cards"
                        : "Aadhaar_Cards"
                );


            const tempCanvas =
                document.createElement(
                    "canvas"
                );


            try {

                // ------------------------------------------------
                // Disable buttons during processing
                // ------------------------------------------------

                downloadAllPan.disabled =
                    true;

                downloadAllAadhaar.disabled =
                    true;

                downloadBothZip.disabled =
                    true;


                // ------------------------------------------------
                // Generate every record
                // ------------------------------------------------

                for (
                    let i = 0;
                    i < parsedRecords.length;
                    i++
                ) {

                    const record =
                        parsedRecords[i];


                    batchStatus.textContent =
                        `Generating ${type}: ` +
                        `${i + 1}/${parsedRecords.length}...`;


                    // --------------------------------------------
                    // Render original document
                    // --------------------------------------------

                    await drawSyntheticDocument(
                        tempCanvas,
                        record,
                        type,
                        record.photoDataUrl
                    );


                    // --------------------------------------------
                    // Compress to < 80 KB
                    // --------------------------------------------

                    const result =
                        await getCompressedImageBlob(
                            tempCanvas
                        );


                    // --------------------------------------------
                    // Create safe file name
                    // --------------------------------------------

                    const safe =
                        record.name
                            .replace(
                                /\s+/g,
                                "_"
                            )
                            .replace(
                                /[^a-zA-Z0-9_-]/g,
                                ""
                            ) ||
                        `record_${i + 1}`;


                    // --------------------------------------------
                    // Put actual JPEG Blob into ZIP
                    //
                    // No Base64 conversion required.
                    // --------------------------------------------

                    folder.file(
                        `${i + 1}_${safe}_${type}.jpg`,
                        result.blob
                    );
                }


                // ------------------------------------------------
                // Generate ZIP
                // ------------------------------------------------

                batchStatus.textContent =
                    `Preparing ${type} ZIP...`;


                const blob =
                    await zip.generateAsync(
                        {
                            type:
                                "blob"
                        }
                    );


                downloadBlob(
                    blob,
                    `${type}_Test_Cards.zip`
                );


                batchStatus.textContent =
                    `${type} ZIP ready. ` +
                    `All images are below 80 KB.`;

            } catch (error) {

                console.error(
                    `${type} ZIP generation failed:`,
                    error
                );


                batchStatus.textContent =
                    error.message ||
                    `Could not generate ${type} ZIP.`;

            } finally {

                // ------------------------------------------------
                // Restore buttons
                // ------------------------------------------------

                setBatchButtons();
            }
        }


        // ====================================================
        // GENERATE COMBINED PAN + AADHAAR ZIP
        // ====================================================

        downloadBothZip.onclick =
            async () => {

                if (
                    !parsedRecords.length
                ) {

                    return;
                }


                const zip =
                    new JSZip();


                const panFolder =
                    zip.folder(
                        "PAN_Cards"
                    );


                const aadhaarFolder =
                    zip.folder(
                        "Aadhaar_Cards"
                    );


                const tempCanvas =
                    document.createElement(
                        "canvas"
                    );


                try {

                    downloadAllPan.disabled =
                        true;

                    downloadAllAadhaar.disabled =
                        true;

                    downloadBothZip.disabled =
                        true;


                    // ------------------------------------------------
                    // Process each record
                    // ------------------------------------------------

                    for (
                        let i = 0;
                        i < parsedRecords.length;
                        i++
                    ) {

                        const record =
                            parsedRecords[i];


                        const safe =
                            record.name
                                .replace(
                                    /\s+/g,
                                    "_"
                                )
                                .replace(
                                    /[^a-zA-Z0-9_-]/g,
                                    ""
                                ) ||
                            `record_${i + 1}`;


                        // ============================================
                        // PAN
                        // ============================================

                        batchStatus.textContent =
                            `Generating PAN: ` +
                            `${i + 1}/${parsedRecords.length}...`;


                        await drawSyntheticDocument(
                            tempCanvas,
                            record,
                            "PAN",
                            record.photoDataUrl
                        );


                        const panResult =
                            await getCompressedImageBlob(
                                tempCanvas
                            );


                        panFolder.file(
                            `${i + 1}_${safe}_PAN.jpg`,
                            panResult.blob
                        );


                        // ============================================
                        // AADHAAR
                        // ============================================

                        batchStatus.textContent =
                            `Generating Aadhaar: ` +
                            `${i + 1}/${parsedRecords.length}...`;


                        await drawSyntheticDocument(
                            tempCanvas,
                            record,
                            "Aadhaar",
                            record.photoDataUrl
                        );


                        const aadhaarResult =
                            await getCompressedImageBlob(
                                tempCanvas
                            );


                        aadhaarFolder.file(
                            `${i + 1}_${safe}_Aadhaar.jpg`,
                            aadhaarResult.blob
                        );
                    }


                    // ------------------------------------------------
                    // Create combined ZIP
                    // ------------------------------------------------

                    batchStatus.textContent =
                        "Preparing combined ZIP...";


                    const blob =
                        await zip.generateAsync(
                            {
                                type:
                                    "blob"
                            }
                        );


                    downloadBlob(
                        blob,
                        "All_Synthetic_Test_Cards.zip"
                    );


                    batchStatus.textContent =
                        "Combined ZIP ready. " +
                        "All images are below 80 KB.";

                } catch (error) {

                    console.error(
                        "Combined ZIP generation failed:",
                        error
                    );


                    batchStatus.textContent =
                        error.message ||
                        "Could not generate combined ZIP.";

                } finally {

                    setBatchButtons();
                }
            };


        // ====================================================
        // DOWNLOAD BLOB
        // ====================================================

        function downloadBlob(
            blob,
            name
        ) {

            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                url;


            link.download =
                name;


            document.body.appendChild(
                link
            );


            link.click();


            link.remove();


            setTimeout(
                () => {

                    URL.revokeObjectURL(
                        url
                    );

                },
                1000
            );
        }


        // ====================================================
        // INITIAL APPLICATION STATE
        // ====================================================

        setMode(false);

        setBatchButtons();

        updateSummary();

    }
);