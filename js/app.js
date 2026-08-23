// ============================================================
// FILE: js/app.js
//
// PURPOSE:
//     Main controller for the Synthetic PAN / Aadhaar OCR
//     Test Data Generator.
//
// RESPONSIBILITIES:
//
//     MANUAL MODE
//     -----------------------------
//     - Accept manual test data.
//     - Generate random test data.
//     - Render PAN / Aadhaar preview.
//     - Download generated card.
//
//     BATCH MODE
//     -----------------------------
//     - Read Excel records.
//     - Match photos.
//     - Generate PAN cards.
//     - Generate Aadhaar cards.
//     - Normalize photos to 900x1200.
//     - Create individual ZIP files.
//     - Create combined ZIP file.
//
// ZIP STRUCTURE
//     -----------------------------
//
//     All_Synthetic_Test_Cards.zip
//
//     ├── PAN_Cards/
//     ├── Aadhaar_Cards/
//     └── Photos/
//
// IMAGE REQUIREMENTS
//     -----------------------------
//
//     PAN / Aadhaar:
//         < 80 KB
//
//     Photos:
//         exactly 900 x 1200 pixels
//
// DEPENDENCIES:
//
//     data-generator.js
//         -> random test data
//
//     document-renderer.js
//         -> renders PAN / Aadhaar canvas
//
//     image-export.js
//         -> JPEG compression
//         -> photo normalization
//
//     XLSX
//         -> Excel processing
//
//     JSZip
//         -> ZIP generation
// ============================================================


document.addEventListener(
    "DOMContentLoaded",
    () => {

        // ====================================================
        // DOM REFERENCES
        // ====================================================

        const $ =
            id =>
                document.getElementById(id);


        // ----------------------------------------------------
        // Mode
        // ----------------------------------------------------

        const modeManualBtn =
            $("modeManualBtn");

        const modeBatchBtn =
            $("modeBatchBtn");

        const manualSection =
            $("manualSection");

        const batchSection =
            $("batchSection");


        // ----------------------------------------------------
        // Manual form
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // Manual actions
        // ----------------------------------------------------

        const generateBtn =
            $("generateBtn");

        const randomizeBtn =
            $("randomizeBtn");

        const clearBtn =
            $("clearBtn");

        const downloadCardBtn =
            $("downloadCardBtn");


        // ----------------------------------------------------
        // Preview
        // ----------------------------------------------------

        const canvas =
            $("cardCanvas");

        const emptyPreview =
            $("emptyPreview");

        const manualStatus =
            $("manualStatus");


        // ----------------------------------------------------
        // Excel
        // ----------------------------------------------------

        const uploadExcelTrigger =
            $("uploadExcelTrigger");

        const excelUpload =
            $("excelUpload");

        const excelFileName =
            $("excelFileName");

        const downloadTemplateBtn =
            $("downloadTemplateBtn");


        // ----------------------------------------------------
        // Photos
        // ----------------------------------------------------

        const bulkPhotoUpload =
            $("bulkPhotoUpload");

        const bulkZipUpload =
            $("bulkZipUpload");

        const clearPhotosBtn =
            $("clearPhotosBtn");

        const photoUploadStatus =
            $("photoUploadStatus");


        // ----------------------------------------------------
        // Batch status
        // ----------------------------------------------------

        const batchStatus =
            $("batchStatus");

        const recordCount =
            $("recordCount");

        const matchedCount =
            $("matchedCount");

        const missingCount =
            $("missingCount");


        // ----------------------------------------------------
        // Batch table
        // ----------------------------------------------------

        const batchTableBody =
            $("batchTableBody");


        // ----------------------------------------------------
        // Batch download buttons
        // ----------------------------------------------------

        const downloadAllPan =
            $("downloadAllPan");

        const downloadAllAadhaar =
            $("downloadAllAadhaar");

        const downloadBothZip =
            $("downloadBothZip");


        // ====================================================
        // APPLICATION STATE
        // ====================================================

        let currentPhotoDataUrl =
            null;


        let hasGeneratedManual =
            false;


        let parsedRecords =
            [];


        let bulkPhotos =
            {};


        // ====================================================
        // CONFIGURATION
        // ====================================================

        const MAX_CARD_BYTES =
            80 * 1024;


        // ====================================================
        // LOAD STREAMLIT PHOTOS
        // ====================================================

        if (
            window.BULK_PHOTOS &&
            typeof window.BULK_PHOTOS ===
                "object"
        ) {

            bulkPhotos = {
                ...window.BULK_PHOTOS
            };
        }


        // ====================================================
        // NORMALIZE FILE NAME
        // ====================================================

        function normalizeFileName(
            value
        ) {

            return String(
                value || ""
            )
                .trim()
                .replace(
                    /\\/g,
                    "/"
                )
                .split("/")
                .pop()
                .toLowerCase();
        }


        // ====================================================
        // FIND PHOTO FOR RECORD
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
            // First attempt:
            // Match Photo column.
            // ------------------------------------------------

            if (requested) {

                const matchedKey =
                    keys.find(
                        key =>
                            normalizeFileName(
                                key
                            ) ===
                            requested
                    );


                if (matchedKey) {

                    return {

                        dataUrl:
                            bulkPhotos[
                                matchedKey
                            ],

                        filename:
                            matchedKey,

                        reason:
                            "Matched Photo column"
                    };
                }
            }


            // ------------------------------------------------
            // Second attempt:
            // Match person name.
            // ------------------------------------------------

            const normalizedName =
                String(
                    name || ""
                )
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

                const matchedKey =
                    keys.find(
                        key =>
                            String(
                                key
                            )
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


                if (matchedKey) {

                    return {

                        dataUrl:
                            bulkPhotos[
                                matchedKey
                            ],

                        filename:
                            matchedKey,

                        reason:
                            "Matched person name"
                    };
                }
            }


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

        function setMode(
            batchMode
        ) {

            manualSection.style.display =
                batchMode
                    ? "none"
                    : "block";


            batchSection.style.display =
                batchMode
                    ? "block"
                    : "none";


            modeManualBtn.classList.toggle(
                "secondary",
                batchMode
            );


            modeBatchBtn.classList.toggle(
                "secondary",
                !batchMode
            );
        }


        modeManualBtn.onclick =
            () =>
                setMode(false);


        modeBatchBtn.onclick =
            () =>
                setMode(true);


        // ====================================================
        // MANUAL PHOTO
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
        // BUILD MANUAL PERSON OBJECT
        // ====================================================

        function getManualPerson() {

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

                address:
                    inputAddress.value.trim(),

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
                        : ""
            };
        }


        // ====================================================
        // RENDER MANUAL DOCUMENT
        // ====================================================

        async function renderManual() {

            const person =
                getManualPerson();


            if (
                !person.name &&
                !person.parentName &&
                !person.dob &&
                !person.address &&
                !person.pan &&
                !person.aadhaar
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
        // RANDOMIZE DATA
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

                inputName.value =
                    "";

                inputFather.value =
                    "";

                inputDob.value =
                    "";

                inputGender.value =
                    "";

                inputNumber.value =
                    "";

                inputAddress.value =
                    "";

                photoInput.value =
                    "";

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
        // LIVE PREVIEW
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
        // COMPRESS DOCUMENT CANVAS
        //
        // Uses image-export.js.
        // ====================================================

        async function getCompressedImageBlob(
            sourceCanvas
        ) {

            if (
                typeof compressCanvas !==
                "function"
            ) {

                throw new Error(
                    "Image compression module is not loaded."
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


            if (
                result.blob.size >=
                MAX_CARD_BYTES
            ) {

                throw new Error(
                    `Generated card is ` +
                    `${(
                        result.blob.size /
                        1024
                    ).toFixed(1)} KB. ` +
                    `Required size is below 80 KB.`
                );
            }


            return result;
        }


        // ====================================================
        // MANUAL DOWNLOAD
        //
        // Uses the same <80 KB compression used by ZIP files.
        // ====================================================

        downloadCardBtn.onclick =
            async () => {

                try {

                    downloadCardBtn.disabled =
                        true;


                    manualStatus.textContent =
                        "Optimizing image...";


                    const result =
                        await getCompressedImageBlob(
                            canvas
                        );


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
                        `Synthetic_${docTypeSelect.value}_${Date.now()}.jpg`;


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


                    manualStatus.textContent =
                        `Downloaded: ` +
                        `${(
                            result.blob.size /
                            1024
                        ).toFixed(1)} KB`;

                } catch (error) {

                    console.error(
                        "Manual download failed:",
                        error
                    );


                    manualStatus.textContent =
                        error.message ||
                        "Could not download image.";

                } finally {

                    downloadCardBtn.disabled =
                        false;
                }
            };


        // ====================================================
        // READ IMAGE FILE
        // ====================================================

        function readImageFile(
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
                        () =>
                            reject(
                                new Error(
                                    "Could not read image."
                                )
                            );


                    reader.readAsDataURL(
                        file
                    );
                }
            );
        }


        // ====================================================
        // REGISTER PHOTO
        // ====================================================

        function registerPhoto(
            filename,
            dataUrl
        ) {

            bulkPhotos[filename] =
                dataUrl;
        }


        // ====================================================
        // BULK PHOTO UPLOAD
        // ====================================================

        async function loadPhotoFiles(
            files
        ) {

            let added =
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


                const dataUrl =
                    await readImageFile(
                        file
                    );


                registerPhoto(
                    file.name,
                    dataUrl
                );


                added++;
            }


            photoUploadStatus.textContent =
                `${added} photo(s) added. ` +
                `${Object.keys(bulkPhotos).length} ` +
                `photo(s) available.`;
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
        // BULK PHOTO ZIP UPLOAD
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
                            path,
                            entry
                        ] of
                        Object.entries(
                            zip.files
                        )
                    ) {

                        if (
                            entry.dir
                        ) {

                            continue;
                        }


                        if (
                            !(
                                /\.(jpe?g|png|webp|gif)$/i
                            ).test(path)
                        ) {

                            continue;
                        }


                        const blob =
                            await entry.async(
                                "blob"
                            );


                        const photoFile =
                            new File(
                                [
                                    blob
                                ],
                                path
                                    .split("/")
                                    .pop(),
                                {
                                    type:
                                        blob.type ||
                                        "image/jpeg"
                                }
                            );


                        const dataUrl =
                            await readImageFile(
                                photoFile
                            );


                        registerPhoto(
                            photoFile.name,
                            dataUrl
                        );


                        count++;
                    }


                    photoUploadStatus.textContent =
                        `${count} photo(s) extracted. ` +
                        `${Object.keys(bulkPhotos).length} ` +
                        `photo(s) available.`;


                    if (
                        parsedRecords.length
                    ) {

                        relinkPhotos();
                    }

                } catch (error) {

                    console.error(
                        error
                    );


                    photoUploadStatus.textContent =
                        "Could not read photo ZIP.";
                }
            };


        // ====================================================
        // CLEAR PHOTOS
        // ====================================================

        clearPhotosBtn.onclick =
            () => {

                bulkPhotos =
                    {};


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
        // DOWNLOAD SAMPLE EXCEL
        // ====================================================

        downloadTemplateBtn.onclick =
            event => {

                event.preventDefault();


                const rows = [

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
                    ]
                ];


                const workbook =
                    XLSX.utils.book_new();


                const worksheet =
                    XLSX.utils.aoa_to_sheet(
                        rows
                    );


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
        // EXCEL UPLOAD TRIGGER
        // ====================================================

        uploadExcelTrigger.onclick =
            () =>
                excelUpload.click();


        // ====================================================
        // GET VALUE FROM EXCEL ROW
        // ====================================================

        function valueFromRow(
            row,
            keys
        ) {

            for (
                const key of
                keys
            ) {

                if (
                    row[key] !== undefined &&
                    String(
                        row[key]
                    ).trim() !== ""
                ) {

                    return row[key];
                }
            }


            return "";
        }


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


                                        const photoMatch =
                                            findBulkPhoto(
                                                photo,
                                                name
                                            );


                                        const pan =
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


                                        const aadhaar =
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

                                            pan:
                                                pan ||
                                                generatePANNumber(),

                                            aadhaar:
                                                aadhaar ||
                                                generateAadharNumber(),

                                            photo,

                                            photoDataUrl:
                                                photoMatch.dataUrl,

                                            photoFilename:
                                                photoMatch.filename,

                                            photoMatchReason:
                                                photoMatch.reason
                                        };
                                    }
                                );


                            renderBatchTable();

                            updateSummary();

                            setBatchButtons();


                            batchStatus.textContent =
                                `Parsed ` +
                                `${parsedRecords.length} ` +
                                `record(s).`;

                        } catch (error) {

                            console.error(
                                error
                            );


                            batchStatus.textContent =
                                "Could not parse Excel.";
                        }
                    };


                reader.readAsArrayBuffer(
                    file
                );
            };


        // ====================================================
        // RELINK PHOTOS
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
        // UPDATE SUMMARY
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
        // SET BATCH BUTTON STATE
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

        function escapeHtml(
            value
        ) {

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
        // CREATE SAFE FILE NAME
        // ====================================================

        function getSafeRecordName(
            record,
            index
        ) {

            return (
                String(
                    record.name || ""
                )
                    .trim()
                    .replace(
                        /\s+/g,
                        "_"
                    )
                    .replace(
                        /[^a-zA-Z0-9_-]/g,
                        ""
                    ) ||
                `record_${index + 1}`
            );
        }


        // ====================================================
        // ADD NORMALIZED PHOTO TO ZIP
        //
        // PHOTO REQUIREMENT:
        //
        //     900 x 1200 pixels
        //
        // The actual conversion is handled by
        // preparePhotoForZip() in image-export.js.
        // ====================================================

        async function addPhotoToZip(
            photoFolder,
            record,
            index
        ) {

            if (
                !record.photoDataUrl
            ) {

                return;
            }


            const photoBlob =
                await preparePhotoForZip(
                    record.photoDataUrl
                );


            if (!photoBlob) {

                return;
            }


            const safe =
                getSafeRecordName(
                    record,
                    index
                );


            photoFolder.file(
                `${index + 1}_${safe}_Photo.jpg`,
                photoBlob
            );
        }


        // ====================================================
        // ADD DOCUMENT TO ZIP
        // ====================================================

        async function addDocumentToZip(
            folder,
            tempCanvas,
            record,
            index,
            type
        ) {

            // ------------------------------------------------
            // Render document
            // ------------------------------------------------

            await drawSyntheticDocument(
                tempCanvas,
                record,
                type,
                record.photoDataUrl
            );


            // ------------------------------------------------
            // Compress below 80 KB
            // ------------------------------------------------

            const result =
                await getCompressedImageBlob(
                    tempCanvas
                );


            // ------------------------------------------------
            // File name
            // ------------------------------------------------

            const safe =
                getSafeRecordName(
                    record,
                    index
                );


            folder.file(
                `${index + 1}_${safe}_${type}.jpg`,
                result.blob
            );


            return result;
        }


        // ====================================================
        // GENERATE TYPE ZIP
        //
        // PAN ZIP:
        //
        //     PAN_Cards/
        //     Photos/
        //
        // Aadhaar ZIP:
        //
        //     Aadhaar_Cards/
        //     Photos/
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


            const cardFolder =
                zip.folder(
                    type === "PAN"
                        ? "PAN_Cards"
                        : "Aadhaar_Cards"
                );


            const photoFolder =
                zip.folder(
                    "Photos"
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


                    // ------------------------------------------------
                    // Document
                    // ------------------------------------------------

                    const result =
                        await addDocumentToZip(
                            cardFolder,
                            tempCanvas,
                            record,
                            i,
                            type
                        );


                    // ------------------------------------------------
                    // Photo
                    // ------------------------------------------------

                    await addPhotoToZip(
                        photoFolder,
                        record,
                        i
                    );


                    batchStatus.textContent =
                        `${type} ${i + 1}/${parsedRecords.length} ` +
                        `ready ` +
                        `(${result.sizeKB.toFixed(1)} KB)`;
                }


                // ------------------------------------------------
                // Create ZIP
                // ------------------------------------------------

                batchStatus.textContent =
                    `Preparing ${type} ZIP...`;


                const zipBlob =
                    await zip.generateAsync(
                        {
                            type:
                                "blob"
                        }
                    );


                downloadBlob(
                    zipBlob,
                    `${type}_Test_Cards.zip`
                );


                batchStatus.textContent =
                    `${type} ZIP ready. ` +
                    `Cards < 80 KB, photos 900x1200.`;


            } catch (error) {

                console.error(
                    `${type} ZIP generation failed:`,
                    error
                );


                batchStatus.textContent =
                    error.message ||
                    `Could not generate ${type} ZIP.`;

            } finally {

                setBatchButtons();
            }
        }


        // ====================================================
        // PAN ZIP BUTTON
        // ====================================================

        downloadAllPan.onclick =
            () =>
                generateZipArchive(
                    "PAN"
                );


        // ====================================================
        // AADHAAR ZIP BUTTON
        // ====================================================

        downloadAllAadhaar.onclick =
            () =>
                generateZipArchive(
                    "Aadhaar"
                );


        // ====================================================
        // COMBINED ZIP
        //
        // STRUCTURE:
        //
        //     PAN_Cards/
        //     Aadhaar_Cards/
        //     Photos/
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


                const photoFolder =
                    zip.folder(
                        "Photos"
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


                    for (
                        let i = 0;
                        i < parsedRecords.length;
                        i++
                    ) {

                        const record =
                            parsedRecords[i];


                        // =========================================
                        // PAN
                        // =========================================

                        batchStatus.textContent =
                            `Generating PAN: ` +
                            `${i + 1}/${parsedRecords.length}...`;


                        const panResult =
                            await addDocumentToZip(
                                panFolder,
                                tempCanvas,
                                record,
                                i,
                                "PAN"
                            );


                        // =========================================
                        // AADHAAR
                        // =========================================

                        batchStatus.textContent =
                            `Generating Aadhaar: ` +
                            `${i + 1}/${parsedRecords.length}...`;


                        const aadhaarResult =
                            await addDocumentToZip(
                                aadhaarFolder,
                                tempCanvas,
                                record,
                                i,
                                "Aadhaar"
                            );


                        // =========================================
                        // PHOTO
                        // =========================================

                        batchStatus.textContent =
                            `Preparing photo: ` +
                            `${i + 1}/${parsedRecords.length}...`;


                        await addPhotoToZip(
                            photoFolder,
                            record,
                            i
                        );


                        batchStatus.textContent =
                            `Record ${i + 1}/` +
                            `${parsedRecords.length} ready ` +
                            `(PAN ${panResult.sizeKB.toFixed(1)} KB, ` +
                            `Aadhaar ${aadhaarResult.sizeKB.toFixed(1)} KB)`;
                    }


                    // =================================================
                    // CREATE ZIP
                    // =================================================

                    batchStatus.textContent =
                        "Preparing combined ZIP...";


                    const zipBlob =
                        await zip.generateAsync(
                            {
                                type:
                                    "blob"
                            }
                        );


                    downloadBlob(
                        zipBlob,
                        "All_Synthetic_Test_Cards.zip"
                    );


                    batchStatus.textContent =
                        "Combined ZIP ready. " +
                        "Cards < 80 KB, photos 900x1200.";


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
            filename
        ) {

            const url =
                URL.createObjectURL(
                    blob
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
        }


        // ====================================================
        // INITIAL APPLICATION STATE
        // ====================================================

        setMode(false);

        setBatchButtons();

        updateSummary();

    }
);