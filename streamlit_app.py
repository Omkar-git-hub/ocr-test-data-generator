# ============================================================
# FILE: streamlit_app.py
#
# PURPOSE:
#     Streamlit entry point for the synthetic OCR test-data
#     generator.
#
# RESPONSIBILITIES:
#     1. Load HTML
#     2. Load CSS
#     3. Load JavaScript files
#     4. Load Excel template
#     5. Load bulk-upload photos
#     6. Load PAN/Aadhaar PNG templates
#     7. Inject all required data into the browser
# ============================================================

import base64
import json
from pathlib import Path

import streamlit as st
import streamlit.components.v1 as components


# ============================================================
# STREAMLIT CONFIGURATION
# ============================================================

st.set_page_config(
    page_title="Test Data Generator",
    page_icon="🧪",
    layout="wide",
    initial_sidebar_state="collapsed",
)


# ============================================================
# PROJECT PATH
# ============================================================

BASE_DIR = Path(__file__).resolve().parent


# ============================================================
# CORE PROJECT FILES
# ============================================================

INDEX_FILE = (
    BASE_DIR / "index.html"
)

CSS_FILE = (
    BASE_DIR / "css" / "style.css"
)

JS_FILES = [
    BASE_DIR / "js" / "data-generator.js",
    BASE_DIR / "js" / "document-renderer.js",
    BASE_DIR / "js" / "image-export.js",
    BASE_DIR / "js" / "app.js",
]

TEMPLATE_EXCEL = (
    BASE_DIR
    / "sample"
    / "ocr-test-data-template.xlsx"
)


# ============================================================
# DOCUMENT TEMPLATES
#
# These are the background templates used by the renderer.
# ============================================================

PAN_TEMPLATE = (
    BASE_DIR
    / "templates"
    / "PAN_Template.png"
)

AADHAAR_TEMPLATE = (
    BASE_DIR
    / "templates"
    / "AADHAR_Template.png"
)


# ============================================================
# BULK PHOTO DIRECTORY
# ============================================================

PHOTO_DIR = (
    BASE_DIR
    / "BulkUpload_photos"
)


SUPPORTED_IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
}


# ============================================================
# REQUIRED FILE VALIDATION
# ============================================================

required_files = [
    INDEX_FILE,
    CSS_FILE,
    TEMPLATE_EXCEL,
    PAN_TEMPLATE,
    AADHAAR_TEMPLATE,
    *JS_FILES,
]


missing_files = [
    str(file.relative_to(BASE_DIR))
    for file in required_files
    if not file.exists()
]


if missing_files:

    st.error(
        "Required project files are missing:"
    )

    for file in missing_files:
        st.code(file)

    st.stop()


# ============================================================
# CREATE BULK PHOTO DIRECTORY
# ============================================================

PHOTO_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ============================================================
# FILE -> BASE64 DATA URL
# ============================================================

def file_to_data_url(
    file_path: Path,
    mime_type: str,
) -> str:
    """
    Convert a local file into a browser-compatible
    Base64 Data URL.
    """

    encoded = base64.b64encode(
        file_path.read_bytes()
    ).decode("utf-8")

    return (
        f"data:{mime_type};base64,{encoded}"
    )


# ============================================================
# LOAD PAN TEMPLATE
# ============================================================

pan_template_base64 = file_to_data_url(
    PAN_TEMPLATE,
    "image/png",
)


# ============================================================
# LOAD AADHAAR TEMPLATE
# ============================================================

aadhaar_template_base64 = file_to_data_url(
    AADHAAR_TEMPLATE,
    "image/png",
)


# ============================================================
# LOAD BULK PHOTOS
# ============================================================

bulk_photos = {}


for photo_file in sorted(
    PHOTO_DIR.iterdir()
):

    if not photo_file.is_file():
        continue

    extension = (
        photo_file.suffix.lower()
    )

    if extension not in SUPPORTED_IMAGE_EXTENSIONS:
        continue

    mime_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".gif": "image/gif",
    }

    try:

        bulk_photos[
            photo_file.name
        ] = file_to_data_url(
            photo_file,
            mime_types[extension],
        )

    except Exception as error:

        st.warning(
            f"Could not load "
            f"{photo_file.name}: {error}"
        )


# ============================================================
# READ HTML
# ============================================================

html = INDEX_FILE.read_text(
    encoding="utf-8"
)


# ============================================================
# READ CSS
# ============================================================

css = CSS_FILE.read_text(
    encoding="utf-8"
)


# ============================================================
# READ JAVASCRIPT
# ============================================================

javascript_parts = []


for js_file in JS_FILES:

    javascript_parts.append(
        f"""
// ============================================================
// LOADED FILE: {js_file.name}
// ============================================================

{js_file.read_text(encoding="utf-8")}
"""
    )


javascript = "\n".join(
    javascript_parts
)


# ============================================================
# READ EXCEL TEMPLATE
# ============================================================

excel_template_base64 = base64.b64encode(
    TEMPLATE_EXCEL.read_bytes()
).decode("utf-8")


# ============================================================
# REMOVE LOCAL CSS REFERENCE
# ============================================================

html = html.replace(
    '<link rel="stylesheet" href="css/style.css">',
    "",
)


# ============================================================
# REMOVE LOCAL JAVASCRIPT REFERENCES
#
# Streamlit injects the JS itself below.
# ============================================================

for js_file in JS_FILES:

    html = html.replace(
        f'<script src="js/{js_file.name}"></script>',
        "",
    )


# ============================================================
# JAVASCRIPT DATA INJECTION
# ============================================================

runtime_data = f"""
<script>

window.OCR_TEMPLATE_BASE64 =
    "{excel_template_base64}";

window.PAN_TEMPLATE_BASE64 =
    "{pan_template_base64}";

window.AADHAAR_TEMPLATE_BASE64 =
    "{aadhaar_template_base64}";

window.BULK_PHOTOS =
    {json.dumps(bulk_photos)};

window.BULK_PHOTO_COUNT =
    {len(bulk_photos)};

</script>
"""


# ============================================================
# FINAL HTML
# ============================================================

final_html = f"""
<!doctype html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        D Card Generator
    </title>


    <!-- =====================================================
         SHEETJS
         ===================================================== -->

    <script
        src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"
    ></script>


    <!-- =====================================================
         JSZIP
         ===================================================== -->

    <script
        src="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"
    ></script>


    <!-- =====================================================
         APPLICATION CSS
         ===================================================== -->

    <style>

        {css}

    </style>

</head>


<body>

    {html}


    <!-- =====================================================
         PYTHON -> JAVASCRIPT DATA
         ===================================================== -->

    {runtime_data}


    <!-- =====================================================
         APPLICATION JAVASCRIPT
         ===================================================== -->

    <script>

        {javascript}

    </script>

</body>

</html>
"""


# ============================================================
# RENDER APPLICATION
# ============================================================

components.html(
    final_html,
    height=700,
    scrolling=True,
)