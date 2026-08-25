# ============================================================
# FILE: streamlit_app.py
#
# PURPOSE:
#     Streamlit deployment adapter for the scalable OCR
#     Test Data Generator.
#
# RESPONSIBILITIES:
#     1. Load HTML
#     2. Load CSS
#     3. Load JavaScript modules
#     4. Load Excel template
#     5. Load bulk-upload photos
#     6. Load PAN/Aadhaar templates
#     7. Inject runtime data into browser
#     8. Render the application responsively
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
# STREAMLIT HOST STYLING
# ============================================================

st.markdown(
    """
    <style>

        /* ====================================================
           REMOVE STREAMLIT TOP HEADER / BLACK STRIP
           ==================================================== */

        header[data-testid="stHeader"] {
            display: none !important;
        }

        [data-testid="stHeader"] {
            display: none !important;
        }


        /* ====================================================
           REMOVE STREAMLIT TOP DECORATION
           ==================================================== */

        [data-testid="stDecoration"] {
            display: none !important;
        }


        /* ====================================================
           STREAMLIT APP BACKGROUND
           ==================================================== */

        .stApp {
            background: #ffffff !important;
        }

        .main {
            background: #ffffff !important;
        }


        /* ====================================================
           REMOVE DEFAULT TOP SPACING
           ==================================================== */

        .block-container {
            max-width: 100% !important;

            padding-top: 0 !important;
            padding-bottom: 0 !important;
            padding-left: 0 !important;
            padding-right: 0 !important;

            margin: 0 !important;
        }


        /* ====================================================
           STREAMLIT MAIN CONTAINER
           ==================================================== */

        [data-testid="stAppViewContainer"] {
            background: #ffffff !important;

            padding: 0 !important;

            margin: 0 !important;

            overflow-x: hidden !important;
        }


        /* ====================================================
           STREAMLIT MAIN CONTENT
           ==================================================== */

        [data-testid="stMain"] {
            padding: 0 !important;

            margin: 0 !important;

            background: #ffffff !important;
        }


        /* ====================================================
           EMBEDDED APPLICATION IFRAME
           ==================================================== */

        iframe {
            width: 100% !important;

            border: none !important;

            display: block !important;

            margin: 0 !important;

            padding: 0 !important;
        }


        /* ====================================================
           REMOVE STREAMLIT VERTICAL GAPS
           ==================================================== */

        [data-testid="stVerticalBlock"] {
            gap: 0 !important;
        }


        /* ====================================================
           HORIZONTAL OVERFLOW
           ==================================================== */

        body {
            overflow-x: hidden !important;
        }

    </style>
    """,
    unsafe_allow_html=True,
)

# ============================================================
# PROJECT ROOT
# ============================================================

BASE_DIR = Path(__file__).resolve().parent


# ============================================================
# CORE FILES
# ============================================================

INDEX_FILE = (
    BASE_DIR
    / "index.html"
)


CSS_FILE = (
    BASE_DIR
    / "css"
    / "style.css"
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
# This avoids maintaining duplicate PAN template files.
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


PHOTO_MIME_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
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
# CSS is injected directly into the generated document.
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
# All application JavaScript is bundled directly below.
#
# External scripts such as SheetJS and JSZip are preserved.
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
        js_file
        .relative_to(BASE_DIR)
        .as_posix()
    )


    source = js_file.read_text(
        encoding="utf-8"
    )


    # --------------------------------------------------------
    # ENTITY PAN TEMPLATE
    #
    # Entity renderer normally references:
    #
    # templates/individual/id/PAN_Template.png
    #
    # That relative path is not reliable inside the
    # Streamlit component iframe.
    #
    # Replace it with the Base64 template injected into:
    #
    # window.PAN_TEMPLATE_BASE64
    # --------------------------------------------------------

    if (
        relative_name
        == "js/entity/document-renderer.js"
    ):

        source = re.sub(
            r"""["']templates/individual/id/PAN_Template\.png["']""",
            "window.PAN_TEMPLATE_BASE64",
            source,
        )


    # --------------------------------------------------------
    # Add module source
    # --------------------------------------------------------

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
# STREAMLIT RESPONSIVE HOST FIX
#
# The embedded application is rendered inside an iframe.
#
# These rules ensure:
#
#     1. No black/grey page around the application
#     2. No unnecessary body margin
#     3. Full iframe width
#     4. No horizontal overflow
#     5. Application keeps its own responsive CSS
# ============================================================

HOST_CSS = """
html,
body {

    margin: 0;

    padding: 0;

    width: 100%;

    min-height: 100%;

    background: #ffffff;

}


html {

    overflow-x: hidden;

}


body {

    overflow-x: hidden;

    background: #ffffff;

}


* {

    box-sizing: border-box;

}


img {

    max-width: 100%;

}


button,
input,
select,
textarea {

    max-width: 100%;

}
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


    <meta
        name="color-scheme"
        content="light"
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

        {HOST_CSS}

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
#
# Increased height prevents the Streamlit iframe from becoming
# unnecessarily constrained vertically.
# ============================================================

components.html(
    final_html,
    height=1100,
    scrolling=True,
)