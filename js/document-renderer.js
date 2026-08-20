// ============================================================
// DOCUMENT RENDERER
// Synthetic PAN / Aadhaar OCR Test Documents
// ============================================================

const CANVAS_CONFIG = {
    width: 856,
    height: 539
};

const PHOTO_CONFIG = {
    x: 665,
    y: 145,
    width: 145,
    height: 185
};


// ============================================================
// MAIN RENDERER
// ============================================================

async function drawSyntheticDocument(
    canvas,
    person,
    type = "PAN",
    photoDataUrl = null
) {
    const ctx = canvas.getContext("2d");

    canvas.width = CANVAS_CONFIG.width;
    canvas.height = CANVAS_CONFIG.height;

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const documentType =
        String(type || "PAN").toUpperCase();

    if (documentType === "PAN") {
        renderPanCard(ctx, person || {});
    } else {
        renderAadhaarCard(ctx, person || {});
    }

    await drawPhoto(
        ctx,
        photoDataUrl
    );

    drawSyntheticMark(ctx);
}


// ============================================================
// PHOTO
// ============================================================

function drawPhoto(ctx, src) {

    return new Promise(resolve => {

        const {
            x,
            y,
            width,
            height
        } = PHOTO_CONFIG;

        ctx.save();

        ctx.fillStyle = "#ffffff";

        ctx.fillRect(
            x,
            y,
            width,
            height
        );

        ctx.strokeStyle = "#64748b";

        ctx.lineWidth = 1;

        ctx.strokeRect(
            x,
            y,
            width,
            height
        );

        if (!src) {

            drawPhotoPlaceholder(
                ctx,
                x,
                y,
                width,
                height
            );

            ctx.restore();

            resolve();

            return;
        }

        const img = new Image();

        img.onload = () => {

            ctx.save();

            ctx.beginPath();

            ctx.rect(
                x,
                y,
                width,
                height
            );

            ctx.clip();

            const imageRatio =
                img.width /
                img.height;

            const boxRatio =
                width /
                height;

            let dw;
            let dh;
            let dx;
            let dy;

            if (imageRatio > boxRatio) {

                dh = height;

                dw =
                    height *
                    imageRatio;

                dx =
                    x +
                    (width - dw) / 2;

                dy = y;

            } else {

                dw = width;

                dh =
                    width /
                    imageRatio;

                dx = x;

                dy =
                    y +
                    (height - dh) / 2;
            }

            ctx.drawImage(
                img,
                dx,
                dy,
                dw,
                dh
            );

            ctx.restore();

            ctx.restore();

            resolve();
        };

        img.onerror = () => {

            drawPhotoPlaceholder(
                ctx,
                x,
                y,
                width,
                height
            );

            ctx.restore();

            resolve();
        };

        img.src = src;
    });
}


// ============================================================
// PHOTO PLACEHOLDER
// ============================================================

function drawPhotoPlaceholder(
    ctx,
    x,
    y,
    width,
    height
) {
    ctx.fillStyle = "#e5e7eb";

    ctx.fillRect(
        x,
        y,
        width,
        height
    );

    ctx.fillStyle = "#94a3b8";

    ctx.beginPath();

    ctx.arc(
        x + width / 2,
        y + height * 0.30,
        width * 0.17,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.beginPath();

    ctx.moveTo(
        x + width * 0.14,
        y + height * 0.85
    );

    ctx.quadraticCurveTo(
        x + width / 2,
        y + height * 0.43,
        x + width * 0.86,
        y + height * 0.85
    );

    ctx.closePath();

    ctx.fill();

    ctx.fillStyle = "#475569";

    ctx.font =
        "bold 11px Arial";

    ctx.textAlign = "center";

    ctx.fillText(
        "NO PHOTO",
        x + width / 2,
        y + height - 12
    );
}


// ============================================================
// PAN CARD
// ============================================================

function renderPanCard(ctx, person) {

    const w =
        ctx.canvas.width;

    const h =
        ctx.canvas.height;

    drawPanBackground(ctx);

    // --------------------------------------------------------
    // Header
    // --------------------------------------------------------

    ctx.textAlign = "center";

    ctx.fillStyle = "#24364b";

    ctx.font =
        "bold 20px Arial";

    ctx.fillText(
        "TEST DEMO DEPARTMENT",
        w / 2,
        50
    );

    ctx.font =
        "bold 11px Arial";

    ctx.fillStyle = "#526579";

    ctx.fillText(
        "PERMANENT ACCOUNT TEST DOCUMENT",
        w / 2,
        69
    );

    // Small test emblem
    drawPanEmblem(
        ctx,
        58,
        54
    );

    // Right test indicator
    ctx.textAlign = "right";

    ctx.font =
        "bold 10px Arial";

    ctx.fillStyle = "#64748b";

    ctx.fillText(
        "PAN OCR TEST",
        w - 38,
        48
    );

    ctx.font =
        "9px Arial";

    ctx.fillText(
        "SYNTHETIC",
        w - 38,
        64
    );

    // --------------------------------------------------------
    // PAN NUMBER BAND
    // --------------------------------------------------------

    ctx.fillStyle =
        "rgba(255,255,255,0.55)";

    ctx.fillRect(
        250,
        82,
        356,
        45
    );

    ctx.strokeStyle =
        "#8fa1b2";

    ctx.strokeRect(
        250,
        82,
        356,
        45
    );

    ctx.textAlign = "center";

    ctx.fillStyle = "#64748b";

    ctx.font =
        "bold 8px Arial";

    ctx.fillText(
        "PERMANENT ACCOUNT NUMBER",
        w / 2,
        94
    );

    ctx.fillStyle = "#172033";

    ctx.font =
        "bold 27px Courier New";

    ctx.fillText(
        person.pan ||
        "ABCDE1234F",
        w / 2,
        118
    );

    // --------------------------------------------------------
    // Main divider
    // --------------------------------------------------------

    ctx.strokeStyle =
        "#8fa1b2";

    ctx.lineWidth = 1;

    ctx.beginPath();

    ctx.moveTo(
        38,
        140
    );

    ctx.lineTo(
        w - 38,
        140
    );

    ctx.stroke();

    // --------------------------------------------------------
    // LEFT INFORMATION AREA
    // --------------------------------------------------------

    drawPanField(
        ctx,
        "NAME",
        person.name,
        174
    );

    drawPanField(
        ctx,
        "FATHER / PARENT NAME",
        person.parentName,
        218
    );

    drawPanField(
        ctx,
        "DATE OF BIRTH",
        person.dob,
        262
    );

    drawPanAddress(
        ctx,
        person.address
    );

    // --------------------------------------------------------
    // PHOTO
    // --------------------------------------------------------

    drawPhotoHeading(
        ctx,
        "PHOTOGRAPH",
        PHOTO_CONFIG.x,
        PHOTO_CONFIG.y - 10
    );

    // --------------------------------------------------------
    // SIGNATURE
    // --------------------------------------------------------

    ctx.textAlign = "left";

    ctx.fillStyle = "#64748b";

    ctx.font =
        "bold 9px Arial";

    ctx.fillText(
        "SIGNATURE",
        48,
        391
    );

    ctx.strokeStyle =
        "#7b8794";

    ctx.beginPath();

    ctx.moveTo(
        48,
        407
    );

    ctx.lineTo(
        210,
        407
    );

    ctx.stroke();

    // --------------------------------------------------------
    // TEST REFERENCE
    // --------------------------------------------------------

    ctx.fillStyle = "#64748b";

    ctx.font =
        "9px Arial";

    ctx.fillText(
        "OCR TEST REFERENCE",
        48,
        445
    );

    ctx.fillStyle = "#273444";

    ctx.font =
        "bold 11px Courier New";

    ctx.fillText(
        createReference(
            person.pan,
            "PAN"
        ),
        48,
        461
    );

    // --------------------------------------------------------
    // Footer
    // --------------------------------------------------------

    drawDocumentFooter(
        ctx,
        "SYNTHETIC PAN OCR TEST DATA"
    );
}


// ============================================================
// PAN BACKGROUND
// ============================================================

function drawPanBackground(ctx) {

    const w =
        ctx.canvas.width;

    const h =
        ctx.canvas.height;

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            w,
            h
        );

    gradient.addColorStop(
        0,
        "#d9e9f5"
    );

    gradient.addColorStop(
        0.30,
        "#e8eef4"
    );

    gradient.addColorStop(
        0.55,
        "#f2e7ef"
    );

    gradient.addColorStop(
        0.78,
        "#dcebf3"
    );

    gradient.addColorStop(
        1,
        "#cddfea"
    );

    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        w,
        h
    );

    // Fine diagonal pattern

    ctx.save();

    ctx.globalAlpha = 0.11;

    ctx.strokeStyle =
        "#47789d";

    ctx.lineWidth = 1;

    for (
        let x = -500;
        x < w + 500;
        x += 18
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            135
        );

        ctx.lineTo(
            x + 300,
            h
        );

        ctx.stroke();
    }

    ctx.restore();

    // Fine horizontal pattern

    ctx.save();

    ctx.globalAlpha = 0.08;

    ctx.strokeStyle =
        "#8d5d80";

    for (
        let y = 150;
        y < h;
        y += 13
    ) {

        ctx.beginPath();

        ctx.moveTo(
            30,
            y
        );

        ctx.lineTo(
            w - 30,
            y
        );

        ctx.stroke();
    }

    ctx.restore();

    // Borders

    ctx.strokeStyle =
        "#64788b";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        12,
        12,
        w - 24,
        h - 24
    );

    ctx.strokeStyle =
        "#d4dce5";

    ctx.lineWidth = 1;

    ctx.strokeRect(
        20,
        20,
        w - 40,
        h - 40
    );
}


// ============================================================
// PAN FIELD
// ============================================================

function drawPanField(
    ctx,
    label,
    value,
    y
) {

    ctx.textAlign = "left";

    ctx.fillStyle =
        "#657487";

    ctx.font =
        "bold 9px Arial";

    ctx.fillText(
        label,
        48,
        y
    );

    ctx.fillStyle =
        "#172033";

    ctx.font =
        "bold 15px Arial";

    ctx.fillText(
        String(
            value ||
            "NOT PROVIDED"
        ),
        205,
        y
    );
}


// ============================================================
// PAN ADDRESS
// ============================================================

function drawPanAddress(
    ctx,
    address
) {

    ctx.textAlign = "left";

    ctx.fillStyle =
        "#657487";

    ctx.font =
        "bold 9px Arial";

    ctx.fillText(
        "ADDRESS",
        48,
        306
    );

    ctx.fillStyle =
        "#172033";

    ctx.font =
        "bold 13px Arial";

    drawWrappedText(
        ctx,
        String(
            address ||
            "NOT PROVIDED"
        ),
        205,
        302,
        410,
        18
    );
}


// ============================================================
// PAN EMBLEM
// ============================================================

function drawPanEmblem(
    ctx,
    x,
    y
) {

    ctx.save();

    ctx.translate(
        x,
        y
    );

    ctx.strokeStyle =
        "#456b89";

    ctx.lineWidth = 1.5;

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        17,
        0,
        Math.PI * 2
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        11,
        0,
        Math.PI * 2
    );

    ctx.stroke();

    ctx.fillStyle =
        "#456b89";

    ctx.font =
        "bold 7px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        "TEST",
        0,
        3
    );

    ctx.restore();
}


// ============================================================
// AADHAAR CARD
// ============================================================

function renderAadhaarCard(
    ctx,
    person
) {

    const w =
        ctx.canvas.width;

    const h =
        ctx.canvas.height;

    drawAadhaarBackground(ctx);

    // --------------------------------------------------------
    // Header band
    // --------------------------------------------------------

    ctx.fillStyle =
        "#f28c28";

    ctx.fillRect(
        28,
        27,
        w - 56,
        7
    );

    ctx.fillStyle =
        "#ffffff";

    ctx.fillRect(
        28,
        34,
        w - 56,
        6
    );

    ctx.fillStyle =
        "#198754";

    ctx.fillRect(
        28,
        40,
        w - 56,
        7
    );

    // --------------------------------------------------------
    // Header
    // --------------------------------------------------------

    ctx.textAlign =
        "left";

    ctx.fillStyle =
        "#344054";

    ctx.font =
        "bold 20px Arial";

    ctx.fillText(
        "TEST DEMO IDENTIFICATION",
        42,
        77
    );

    ctx.font =
        "bold 11px Arial";

    ctx.fillStyle =
        "#667085";

    ctx.fillText(
        "SYNTHETIC IDENTITY OCR TEST DOCUMENT",
        42,
        97
    );

    // Identity symbol

    drawAadhaarIdentityMark(
        ctx,
        428,
        70
    );

    // Right header

    ctx.textAlign =
        "right";

    ctx.fillStyle =
        "#667085";

    ctx.font =
        "bold 10px Arial";

    ctx.fillText(
        "AADHAAR OCR TEST",
        w - 40,
        76
    );

    ctx.font =
        "9px Arial";

    ctx.fillText(
        "SYNTHETIC",
        w - 40,
        94
    );

    // --------------------------------------------------------
    // Divider
    // --------------------------------------------------------

    ctx.strokeStyle =
        "#aeb8c2";

    ctx.beginPath();

    ctx.moveTo(
        38,
        119
    );

    ctx.lineTo(
        w - 38,
        119
    );

    ctx.stroke();

    // --------------------------------------------------------
    // Fields
    // --------------------------------------------------------

    drawAadhaarField(
        ctx,
        "NAME",
        person.name,
        160
    );

    drawAadhaarField(
        ctx,
        "DATE OF BIRTH",
        person.dob,
        200
    );

    drawAadhaarField(
        ctx,
        "GENDER",
        person.gender,
        240
    );

    drawAadhaarAddress(
        ctx,
        person.address
    );

    // --------------------------------------------------------
    // Photo
    // --------------------------------------------------------

    drawPhotoHeading(
        ctx,
        "PHOTOGRAPH",
        PHOTO_CONFIG.x,
        PHOTO_CONFIG.y - 10
    );

    // --------------------------------------------------------
    // Aadhaar number area
    // --------------------------------------------------------

    ctx.fillStyle =
        "rgba(255,255,255,0.72)";

    ctx.fillRect(
        45,
        352,
        430,
        58
    );

    ctx.strokeStyle =
        "#b4bec8";

    ctx.strokeRect(
        45,
        352,
        430,
        58
    );

    ctx.textAlign =
        "center";

    ctx.fillStyle =
        "#667085";

    ctx.font =
        "bold 8px Arial";

    ctx.fillText(
        "IDENTIFICATION NUMBER",
        260,
        365
    );

    ctx.fillStyle =
        "#172033";

    ctx.font =
        "bold 29px Courier New";

    ctx.fillText(
        formatAadhaar(
            person.aadhaar ||
            "000000000000"
        ),
        260,
        394
    );

    // --------------------------------------------------------
    // Barcode
    // --------------------------------------------------------

    drawTestBarcode(
        ctx,
        48,
        430,
        275,
        46,
        person.aadhaar ||
            "000000000000"
    );

    // --------------------------------------------------------
    // QR
    // --------------------------------------------------------

    drawTestQrPattern(
        ctx,
        550,
        365,
        85,
        person.aadhaar ||
            "000000000000"
    );

    // --------------------------------------------------------
    // Reference
    // --------------------------------------------------------

    ctx.textAlign =
        "left";

    ctx.fillStyle =
        "#667085";

    ctx.font =
        "9px Arial";

    ctx.fillText(
        "OCR TEST REFERENCE",
        350,
        447
    );

    ctx.fillStyle =
        "#273444";

    ctx.font =
        "bold 10px Courier New";

    ctx.fillText(
        createReference(
            person.aadhaar,
            "AADHAAR"
        ),
        350,
        464
    );

    // --------------------------------------------------------
    // Footer
    // --------------------------------------------------------

    drawDocumentFooter(
        ctx,
        "SYNTHETIC AADHAAR OCR TEST DATA"
    );
}


// ============================================================
// AADHAAR BACKGROUND
// ============================================================

function drawAadhaarBackground(ctx) {

    const w =
        ctx.canvas.width;

    const h =
        ctx.canvas.height;

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            w,
            h
        );

    gradient.addColorStop(
        0,
        "#eef8f1"
    );

    gradient.addColorStop(
        0.45,
        "#ffffff"
    );

    gradient.addColorStop(
        1,
        "#e5f3ea"
    );

    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        w,
        h
    );

    // Fine identity-style pattern

    ctx.save();

    ctx.globalAlpha = 0.07;

    ctx.strokeStyle =
        "#15803d";

    for (
        let x = -400;
        x < w + 400;
        x += 24
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            100
        );

        ctx.lineTo(
            x + 270,
            h
        );

        ctx.stroke();
    }

    ctx.restore();

    // Subtle circular pattern

    ctx.save();

    ctx.globalAlpha = 0.045;

    ctx.strokeStyle =
        "#f28c28";

    for (
        let r = 40;
        r < 400;
        r += 45
    ) {

        ctx.beginPath();

        ctx.arc(
            720,
            270,
            r,
            0,
            Math.PI * 2
        );

        ctx.stroke();
    }

    ctx.restore();

    // Borders

    ctx.strokeStyle =
        "#667085";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        12,
        12,
        w - 24,
        h - 24
    );

    ctx.strokeStyle =
        "#d0d5dd";

    ctx.lineWidth = 1;

    ctx.strokeRect(
        20,
        20,
        w - 40,
        h - 40
    );
}


// ============================================================
// AADHAAR IDENTITY MARK
// ============================================================

function drawAadhaarIdentityMark(
    ctx,
    x,
    y
) {

    ctx.save();

    ctx.translate(
        x,
        y
    );

    ctx.strokeStyle =
        "#15803d";

    ctx.lineWidth = 1.5;

    for (
        let radius = 4;
        radius <= 17;
        radius += 4
    ) {

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            radius,
            Math.PI * 0.12,
            Math.PI * 1.88
        );

        ctx.stroke();
    }

    ctx.fillStyle =
        "#15803d";

    ctx.font =
        "bold 8px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        "ID",
        0,
        27
    );

    ctx.restore();
}


// ============================================================
// AADHAAR FIELD
// ============================================================

function drawAadhaarField(
    ctx,
    label,
    value,
    y
) {

    ctx.textAlign =
        "left";

    ctx.fillStyle =
        "#667085";

    ctx.font =
        "bold 9px Arial";

    ctx.fillText(
        label,
        48,
        y
    );

    ctx.fillStyle =
        "#172033";

    ctx.font =
        "bold 15px Arial";

    ctx.fillText(
        String(
            value ||
            "NOT PROVIDED"
        ),
        195,
        y
    );
}


// ============================================================
// AADHAAR ADDRESS
// ============================================================

function drawAadhaarAddress(
    ctx,
    address
) {

    ctx.textAlign =
        "left";

    ctx.fillStyle =
        "#667085";

    ctx.font =
        "bold 9px Arial";

    ctx.fillText(
        "ADDRESS",
        48,
        282
    );

    ctx.fillStyle =
        "#172033";

    ctx.font =
        "bold 13px Arial";

    drawWrappedText(
        ctx,
        String(
            address ||
            "NOT PROVIDED"
        ),
        195,
        278,
        410,
        17
    );
}


// ============================================================
// PHOTO HEADING
// ============================================================

function drawPhotoHeading(
    ctx,
    text,
    x,
    y
) {

    ctx.textAlign =
        "center";

    ctx.fillStyle =
        "#667085";

    ctx.font =
        "bold 9px Arial";

    ctx.fillText(
        text,
        x +
            PHOTO_CONFIG.width / 2,
        y
    );
}


// ============================================================
// GENERIC WRAPPED TEXT
// ============================================================

function drawWrappedText(
    ctx,
    text,
    x,
    y,
    maxWidth,
    lineHeight
) {

    const words =
        String(text)
            .split(/\s+/);

    let line = "";

    let currentY =
        y;

    for (
        let i = 0;
        i < words.length;
        i++
    ) {

        const testLine =
            line +
            words[i] +
            " ";

        if (
            ctx.measureText(
                testLine
            ).width >
                maxWidth &&
            line
        ) {

            ctx.fillText(
                line.trim(),
                x,
                currentY
            );

            line =
                words[i] +
                " ";

            currentY +=
                lineHeight;

        } else {

            line =
                testLine;
        }
    }

    if (line) {

        ctx.fillText(
            line.trim(),
            x,
            currentY
        );
    }
}


// ============================================================
// AADHAAR NUMBER FORMAT
// ============================================================

function formatAadhaar(
    value
) {

    const digits =
        String(value)
            .replace(/\D/g, "")
            .slice(0, 12);

    return digits
        .replace(
            /(.{4})/g,
            "$1 "
        )
        .trim();
}


// ============================================================
// SYNTHETIC BARCODE
// ============================================================

function drawTestBarcode(
    ctx,
    x,
    y,
    width,
    height,
    seed
) {

    const value =
        String(seed)
            .replace(/\D/g, "") ||
        "000000000000";

    let cursor =
        x;

    while (
        cursor <
        x + width
    ) {

        for (
            let i = 0;
            i < value.length &&
            cursor < x + width;
            i++
        ) {

            const digit =
                Number(value[i]) || 0;

            const barWidth =
                1 +
                (digit % 4);

            ctx.fillStyle =
                i % 2 === 0
                    ? "#172033"
                    : "#667085";

            ctx.fillRect(
                cursor,
                y,
                barWidth,
                height
            );

            cursor +=
                barWidth +
                2;
        }
    }

    ctx.strokeStyle =
        "#cbd5e1";

    ctx.strokeRect(
        x - 4,
        y - 4,
        width + 8,
        height + 8
    );
}


// ============================================================
// SYNTHETIC QR TEST PATTERN
// ============================================================

function drawTestQrPattern(
    ctx,
    x,
    y,
    size,
    seed
) {

    const grid = 13;

    const cell =
        size / grid;

    let hash = 0;

    for (
        const character of String(seed)
    ) {

        hash =
            ((hash << 5) -
                hash) +
            character.charCodeAt(0);

        hash |= 0;
    }

    ctx.fillStyle =
        "#ffffff";

    ctx.fillRect(
        x,
        y,
        size,
        size
    );

    for (
        let row = 0;
        row < grid;
        row++
    ) {

        for (
            let col = 0;
            col < grid;
            col++
        ) {

            const value =
                Math.abs(
                    hash +
                    row * 31 +
                    col * 17
                ) % 7;

            if (
                value < 3
            ) {

                ctx.fillStyle =
                    "#273444";

                ctx.fillRect(
                    x + col * cell,
                    y + row * cell,
                    Math.ceil(cell),
                    Math.ceil(cell)
                );
            }
        }
    }

    drawQrFinder(
        ctx,
        x,
        y,
        cell
    );

    drawQrFinder(
        ctx,
        x + size - cell * 5,
        y,
        cell
    );

    drawQrFinder(
        ctx,
        x,
        y + size - cell * 5,
        cell
    );

    ctx.strokeStyle =
        "#98a2b3";

    ctx.strokeRect(
        x,
        y,
        size,
        size
    );
}


// ============================================================
// QR FINDER
// ============================================================

function drawQrFinder(
    ctx,
    x,
    y,
    cell
) {

    ctx.fillStyle =
        "#273444";

    ctx.fillRect(
        x,
        y,
        cell * 5,
        cell * 5
    );

    ctx.fillStyle =
        "#ffffff";

    ctx.fillRect(
        x + cell,
        y + cell,
        cell * 3,
        cell * 3
    );

    ctx.fillStyle =
        "#273444";

    ctx.fillRect(
        x + cell * 2,
        y + cell * 2,
        cell,
        cell
    );
}


// ============================================================
// DOCUMENT REFERENCE
// ============================================================

function createReference(
    value,
    prefix
) {

    const clean =
        String(
            value ||
            "TEST"
        )
            .replace(
                /[^A-Za-z0-9]/g,
                ""
            )
            .slice(-8)
            .toUpperCase();

    return (
        prefix +
        "-OCR-" +
        (clean || "00000000")
    );
}


// ============================================================
// FOOTER
// ============================================================

function drawDocumentFooter(
    ctx,
    text
) {

    const w =
        ctx.canvas.width;

    const h =
        ctx.canvas.height;

    ctx.textAlign =
        "center";

    ctx.fillStyle =
        "#667085";

    ctx.font =
        "bold 9px Arial";

    ctx.fillText(
        text,
        w / 2,
        h - 34
    );

    ctx.fillStyle =
        "#b42318";

    ctx.font =
        "bold 11px Arial";

    ctx.fillText(
        "NOT A GOVERNMENT DOCUMENT",
        w / 2,
        h - 17
    );
}


// ============================================================
// SYNTHETIC WATERMARK
// ============================================================

function drawSyntheticMark(
    ctx
) {

    const w =
        ctx.canvas.width;

    ctx.save();

    ctx.translate(
        w / 2,
        315
    );

    ctx.rotate(
        -0.16
    );

    ctx.globalAlpha =
        0.055;

    ctx.fillStyle =
        "#344054";

    ctx.font =
        "bold 40px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        "SYNTHETIC TEST DATA",
        0,
        0
    );

    ctx.restore();
}