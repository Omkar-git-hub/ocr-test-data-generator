# ============================================================
# FILE: streamlit_app.py
#
# PURPOSE:
#     Streamlit deployment adapter for the scalable OCR
#     Test Data Generator.
#
#     The actual application remains browser-based HTML/CSS/JS.
#     Streamlit only prepares the files and injects them into
#     the browser.
#
# SUPPORTED:
#     - Individual PAN
#     - Individual Aadhaar
#     - Entity PAN
#     - Manual Input
#     - Bulk Excel
#     - Bulk photos
#     - JPEG download
# ============================================================

import base64
import json
import re
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
# PROJECT ROOT
# ============================================================

BASE_DIR = Path(__file__).resolve().parent


# ============================================================
# CORE FILES
# ============================================================

INDEX_FILE = (
    BASE_DIR / "index.html"
)

CSS_FILE = (
    BASE_DIR / "css" / "style.css"
)

TEMPLATE_EXCEL = (
    BASE_DIR
    / "sample"
    / "ocr-test-data-template.xlsx"
)


# ============================================================
# JAVASCRIPT MODULES
#
# IMPORTANT:
#     Order matters.
#
#     Shared configuration/utilities are loaded first.
#     Individual and Entity modules are then loaded in
#     dependency order.
# ============================================================

JS_FILES = [

    # --------------------------------------------------------
    # Shared
    # --------------------------------------------------------

    BASE_DIR
    / "js"
    / "documents.js",

    BASE_DIR
    / "js"
    / "image-export.js",


    # --------------------------------------------------------
    # Individual module
    # --------------------------------------------------------

    BASE_DIR
    / "js"
    / "individual"
    / "data-generator.js",

    BASE_DIR
    / "js"
    / "individual"
    / "document-renderer.js",

    BASE_DIR
    / "js"
    / "individual"
    / "app.js",


    # --------------------------------------------------------
    # Entity module
    # --------------------------------------------------------

    BASE_DIR
    / "js"
    / "entity"
    / "data-generator.js",

    BASE_DIR
    / "js"
    / "entity"
    / "document-renderer.js",

    BASE_DIR
    / "js"
    / "entity"
    / "app.js",
]


# ============================================================
# INDIVIDUAL DOCUMENT TEMPLATES
#
# Current scalable structure:
#
# templates/
#   individual/
#       id/
#           PAN_Template.png
#           AADHAR_Template.png
# ============================================================

PAN_TEMPLATE = (
    BASE_DIR
    / "templates"
    / "individual"
    / "id"
    / "PAN_Template.png"
)

AADHAAR_TEMPLATE = (
    BASE_DIR
    / "templates"
    / "individual"
    / "id"
    / "AADHAR_Template.png"
)


# ============================================================
# ENTITY TEMPLATE
#
# Entity PAN currently uses the shared Individual PAN template.
#
# The Entity renderer can therefore use the same Base64 PAN
# template without requiring a duplicate file.
# ============================================================

ENTITY_PAN_TEMPLATE = PAN_TEMPLATE


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
    str(
        file.relative_to(BASE_DIR)
    )
    for file in required_files
    if not file.exists()
]


if missing_files:

    st.error(
        "Required project files are missing."
    )

    st.write(
        "The following files could not be found:"
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


PHOTO_MIME_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
}


for photo_file in sorted(
    PHOTO_DIR.iterdir()
):

    if not photo_file.is_file():
        continue

    extension = (
        photo_file.suffix.lower()
    )

    if (
        extension
        not in SUPPORTED_IMAGE_EXTENSIONS
    ):
        continue

    try:

        bulk_photos[
            photo_file.name
        ] = file_to_data_url(
            photo_file,
            PHOTO_MIME_TYPES[extension],
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
# REMOVE LOCAL CSS REFERENCES
#
# CSS is injected directly below.
# ============================================================

html = re.sub(
    r'<link[^>]+href=["\'](?:\./)?css/style\.css["\'][^>]*>',
    "",
    html,
    flags=re.IGNORECASE,
)


# ============================================================
# REMOVE LOCAL JAVASCRIPT REFERENCES
#
# All application JS is bundled below.
#
# External scripts such as SheetJS/JSZip are NOT removed.
# ============================================================

html = re.sub(
    r'<script[^>]+src=["\'](?:\./)?js/[^"\']+["\'][^>]*>\s*</script>',
    "",
    html,
    flags=re.IGNORECASE,
)


# ============================================================
# READ JAVASCRIPT
# ============================================================

javascript_parts = []


for js_file in JS_FILES:

    relative_name = (
        js_file.relative_to(BASE_DIR)
        .as_posix()
    )


    source = js_file.read_text(
        encoding="utf-8"
    )


    # --------------------------------------------------------
    # ENTITY PAN TEMPLATE
    #
    # The Entity renderer normally points to:
    #
    # templates/individual/id/PAN_Template.png
    #
    # That relative path is not reliable inside the
    # Streamlit components iframe.
    #
    # Replace the path with the Base64 template that Streamlit
    # injects into window.PAN_TEMPLATE_BASE64.
    #
    # Regex is used so both single-quoted and double-quoted
    # versions are handled reliably.
    # --------------------------------------------------------

    if relative_name == "js/entity/document-renderer.js":

        source = re.sub(
            r"""["']templates/individual/id/PAN_Template\.png["']""",
            "window.PAN_TEMPLATE_BASE64",
            source,
        )


    javascript_parts.append(
        f"""
// ============================================================
// LOADED FILE:
// {relative_name}
// ============================================================

{source}
"""
    )


javascript = "\n".join(
    javascript_parts
)


# ============================================================
# LOAD EXCEL TEMPLATE
# ============================================================

excel_template_base64 = (
    base64.b64encode(
        TEMPLATE_EXCEL.read_bytes()
    ).decode("utf-8")
)


# ============================================================
# JAVASCRIPT RUNTIME DATA
# ============================================================

runtime_data = f"""
<script>

window.OCR_TEMPLATE_BASE64 =
    {json.dumps(excel_template_base64)};

window.PAN_TEMPLATE_BASE64 =
    {json.dumps(pan_template_base64)};

window.AADHAAR_TEMPLATE_BASE64 =
    {json.dumps(aadhaar_template_base64)};

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
        Test Data Generator
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
         PYTHON -> JAVASCRIPT RUNTIME DATA
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
    height=900,
    scrolling=True,
)