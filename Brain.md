OCR TEST DATA GENERATOR - PROJECT BRAIN

Purpose

Synthetic PAN/Aadhaar-style test document generator for OCR and automation
testing.

The visual documents are synthetic test templates and are not government-issued
documents.

Folder Structure

ocr-test-data-generator-final/
├── index.html
├── streamlit_app.py
├── requirements.txt
│
├── BulkUpload_photos/
│   └── person photos
│
├── css/
│   └── style.css
│
├── js/
│   ├── app.js
│   ├── data-generator.js
│   ├── document-renderer.js
│   └── image-export.js
│
├── sample/
│   └── ocr-test-data-template.xlsx
│
└── templates/
    ├── PAN_Template.jpg
    └── AADHAR_Template.jpg

File Responsibilities

streamlit_app.py

Server-side entry point.

Loads:

HTML

CSS

JavaScript

Excel template

PAN template

Aadhaar template

server-side bulk photos

Binary resources are converted to Base64 and injected into the browser.

Browser variables:

window.PAN_TEMPLATE_BASE64
window.AADHAAR_TEMPLATE_BASE64
window.BULK_PHOTOS
window.OCR_TEMPLATE_BASE64

index.html

UI only.

Contains:

Manual Generator

Document type selection

Person data fields

Photo input

Batch Excel controls

Bulk photo upload

Parsed-record table

Download buttons

Preview canvas

js/data-generator.js

Synthetic data generation.

Responsible for:

PAN number
Aadhaar-style number
Name
Parent name
DOB
Address
Gender
Excel date normalization
ID normalization

js/app.js

Application controller.

Responsible for:

Manual input
Randomize
Clear
Photo upload
Excel parsing
Bulk photo upload
ZIP photo extraction
Photo matching
Record table
PAN ZIP
Aadhaar ZIP
Combined ZIP

Photo matching:

Photo column filename
        |
        v
exact normalized filename
        |
        v
person-name fallback
        |
        v
missing

js/document-renderer.js

Rendering engine.

It does NOT create the document design from scratch.

Instead:

template image
      +
dynamic data
      +
photo
      =
final canvas

PAN and Aadhaar have separate configurations.

js/image-export.js

Converts canvas output to JPEG and provides download helpers.

Template Architecture

templates/
│
├── PAN_Template.jpg
│       |
│       +-- PAN coordinates
│       +-- PAN dynamic text
│       +-- PAN photo
│
└── AADHAR_Template.jpg
        |
        +-- Aadhaar coordinates
        +-- Aadhaar dynamic text
        +-- Aadhaar photo

PAN Coordinates

Current supplied PAN template:

approximately 500 x 500

Current configuration:

Photo:
x=45
y=178
width=65
height=98

Name:
x=27
y=300

Father:
x=27
y=348

DOB:
x=27
y=405

Aadhaar Coordinates

Current supplied Aadhaar template:

approximately 1600 x 900

Current configuration:

Photo:
x=155
y=358
width=260
height=307

Name:
x=535
y=420

DOB:
x=562
y=479

Gender:
x=490
y=535

Aadhaar:
center x=800
baseline y=690

Coordinate System

Origin:

(0,0)

is the top-left.

(0,0) --------------------> X
 |
 |
 |
 v
 Y

Canvas text uses the Y baseline.

Coordinate Picker

document-renderer.js contains:

enableCoordinatePicker(canvas)

Run:

enableCoordinatePicker(
    document.getElementById("cardCanvas")
);

Then click the template.

The browser console reports:

Template coordinate -> X: 535, Y: 420

Use this to tune positions.

Manual Flow

User
 |
 v
index.html form
 |
 v
app.js
 |
 +--> supplied ID
 |
 +--> generated ID if blank
 |
 v
document-renderer.js
 |
 +--> selected template
 +--> dynamic text
 +--> photo
 |
 v
canvas
 |
 v
JPEG download

Batch Flow

Excel
 |
 v
app.js
 |
 v
Rows parsed
 |
 +--> PAN supplied? -> use it
 |       |
 |       +--> blank -> generate PAN
 |
 +--> Aadhaar supplied? -> use it
 |       |
 |       +--> blank -> generate Aadhaar
 |
 +--> Photo filename
          |
          +--> match uploaded image
          |
          +--> fallback to person name
          |
          +--> missing
 |
 v
document-renderer.js
 |
 +--> PAN template
 +--> Aadhaar template
 |
 v
Canvas
 |
 v
JSZip
 |
 v
ZIP download

Important Separation Rules

app.js
    = application control

data-generator.js
    = synthetic data

document-renderer.js
    = document rendering

image-export.js
    = export/download

streamlit_app.py
    = server-side resource injection

templates/
    = visual backgrounds

Do not mix these responsibilities.

Changing a Template

Replace the image in templates/.

Check its native dimensions.

Use the coordinate picker.

Update the corresponding configuration in
js/document-renderer.js.

Test manual preview.

Test Excel batch generation.

Test ZIP generation.

Current Design Principle

The template is the design.

JavaScript only adds:

Name
Parent Name
DOB
Gender
PAN/Aadhaar number
Photo

This makes future template changes much easier than rebuilding the visual
document using canvas drawing commands.