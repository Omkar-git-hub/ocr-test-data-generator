OCR TEST DATA GENERATOR - PROJECT BRAIN

Purpose

Synthetic PAN/Aadhaar-style test document generator for OCR and automation
testing.

The visual documents are synthetic test templates and are not government-issued
documents.

The project is designed to support two document categories:

1. Individual
2. Entity

The Individual implementation is the current working implementation.

Entity support will be added separately without unnecessarily changing the
existing Individual implementation.


============================================================
PROJECT ARCHITECTURE
============================================================

ocr-test-data-generator-final/

├── index.html
├── streamlit_app.py
├── requirements.txt
│
├── BulkUpload_photos/
│   └── person/entity photos
│
├── css/
│   └── style.css
│
├── js/
│   │
│   ├── app.js
│   ├── image-export.js
│   │
│   ├── individual/
│   │   ├── app.js
│   │   ├── data-generator.js
│   │   └── document-renderer.js
│   │
│   └── entity/
│       ├── app.js
│       ├── data-generator.js
│       └── document-renderer.js
│
├── sample/
│   ├── individual-template.xlsx
│   └── entity-template.xlsx
│
├── templates/
│   │
│   ├── individual/
│   │   └── id/
│   │       ├── PAN_Template.png
│   │       └── AADHAR_Template.png
│   │
│   └── entity/
│       ├── id/
│       └── certificates/
│
├── vercel/
│   └── build.js
│
└── vercel.json


============================================================
ARCHITECTURE PRINCIPLE
============================================================

The application has two separate document domains:

Individual
    |
    +-- Individual application logic
    +-- Individual data generation
    +-- Individual document rendering
    +-- Individual templates
    +-- Individual Excel template


Entity
    |
    +-- Entity application logic
    +-- Entity data generation
    +-- Entity document rendering
    +-- Entity templates
    +-- Entity Excel template


Shared functionality remains shared.

Examples:

    image-export.js
    ZIP/image export helpers
    common UI styles
    Vercel deployment configuration


Do not duplicate shared functionality unnecessarily.


============================================================
ROOT JAVASCRIPT FILES
============================================================

js/app.js

Main application entry/controller.

Responsible for:

    Application mode selection
    Individual / Entity selection
    Loading the appropriate application module
    Common application-level coordination


js/image-export.js

Shared image export functionality.

Responsible for:

    Canvas to JPEG conversion
    Image compression
    80 KB validation
    Photo normalization
    900 x 1200 photo generation
    Download helpers
    Export-related validation


This file is shared by Individual and Entity.

Do not create separate copies unless there is a genuine
document-specific requirement.


============================================================
INDIVIDUAL MODULE
============================================================

js/individual/

Contains Individual-specific application code.

Current supported Individual documents:

    PAN
    Aadhaar


------------------------------------------------------------
individual/app.js
------------------------------------------------------------

Individual application controller.

Responsible for:

    Individual manual generation
    Individual batch Excel processing
    Individual photo handling
    Individual record table
    Individual PAN ZIP
    Individual Aadhaar ZIP
    Individual combined ZIP
    Individual-specific UI behaviour


------------------------------------------------------------
individual/data-generator.js
------------------------------------------------------------

Individual synthetic data generation.

Currently responsible for:

    PAN number
    Aadhaar-style number
    Name
    Parent name
    DOB
    Address
    Gender
    Excel date normalization
    ID normalization


------------------------------------------------------------
individual/document-renderer.js
------------------------------------------------------------

Individual document rendering engine.

Responsible for:

    PAN rendering
    Aadhaar rendering
    PAN template loading
    Aadhaar template loading
    Individual document coordinates
    Individual dynamic text
    Individual photo placement


The renderer does NOT create the complete visual document from
scratch.

Instead:

    template image
          +
    dynamic data
          +
    photo
          =
    final canvas


============================================================
ENTITY MODULE
============================================================

js/entity/

Contains Entity-specific application code.

Entity support will be added separately.

Planned responsibilities:

    Entity manual generation
    Entity batch Excel processing
    Entity document rendering
    Entity document-specific data generation
    Entity document downloads


------------------------------------------------------------
entity/app.js
------------------------------------------------------------

Entity application controller.

This file will contain Entity-specific UI and workflow logic.

Do not put Entity-specific logic inside:

    individual/app.js


------------------------------------------------------------
entity/data-generator.js
------------------------------------------------------------

Entity-specific synthetic data generation.

Potential future data includes:

    Entity name
    Entity type
    CIN
    Registration number
    Incorporation date
    Entity PAN
    GST-related identifiers
    Registered address
    Other document-specific fields


Only implement fields when the corresponding Entity document
is actually supported.


------------------------------------------------------------
entity/document-renderer.js
------------------------------------------------------------

Entity-specific document rendering.

Responsible for:

    Entity PAN
    CIN
    Registration Certificate
    Future Entity documents


Each Entity document should have its own template and rendering
configuration where required.


============================================================
TEMPLATE ARCHITECTURE
============================================================

Templates are separated by document category.

templates/

├── individual/
│   └── id/
│       ├── PAN_Template.png
│       └── AADHAR_Template.png
│
└── entity/
    ├── id/
    └── certificates/


Individual templates:

    individual/id/

Entity identity templates:

    entity/id/

Entity certificate templates:

    entity/certificates/


Do not mix Individual and Entity templates.


============================================================
INDIVIDUAL TEMPLATES
============================================================

Current Individual templates:

    templates/individual/id/PAN_Template.png

    templates/individual/id/AADHAR_Template.png


The template is the visual design.

JavaScript adds dynamic information such as:

    Name
    Parent Name
    DOB
    Gender
    PAN/Aadhaar number
    Photo


Do not recreate the complete document design using canvas
drawing commands when a template image already exists.


============================================================
ENTITY TEMPLATES
============================================================

Entity templates will be added under:

    templates/entity/


Identity documents:

    templates/entity/id/


Certificates:

    templates/entity/certificates/


Examples of future documents:

    Entity PAN
    CIN
    Registration Certificate
    GST-related certificate/document


Only add a template when the corresponding document is
implemented.


============================================================
SAMPLE EXCEL FILES
============================================================

Individual and Entity use separate Excel templates.

sample/

├── individual-template.xlsx
└── entity-template.xlsx


Individual Excel:

Used by:

    Individual batch processing


Entity Excel:

Used by:

    Entity batch processing


Do not force Individual and Entity records into the same
Excel structure when their fields are different.


============================================================
CURRENT INDIVIDUAL DATA FLOW
============================================================

Manual Flow

User
 |
 v
index.html
 |
 v
js/app.js
 |
 v
individual/app.js
 |
 +--> supplied ID
 |
 +--> generated ID if blank
 |
 v
individual/document-renderer.js
 |
 +--> selected Individual template
 +--> dynamic data
 +--> photo
 |
 v
canvas
 |
 v
image-export.js
 |
 v
JPEG download


============================================================
CURRENT INDIVIDUAL BATCH FLOW
============================================================

Excel
 |
 v
individual/app.js
 |
 v
Rows parsed
 |
 +--> PAN supplied?
 |       |
 |       +--> yes -> use supplied PAN
 |       |
 |       +--> blank -> generate PAN
 |
 +--> Aadhaar supplied?
 |       |
 |       +--> yes -> use supplied Aadhaar
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
individual/document-renderer.js
 |
 +--> PAN template
 +--> Aadhaar template
 |
 v
Canvas
 |
 v
image-export.js
 |
 v
ZIP download


============================================================
ENTITY DATA FLOW
============================================================

Entity flow will follow the same overall application pattern,
but Entity-specific processing will remain inside:

    js/entity/


Conceptually:

Entity
 |
 v
entity/app.js
 |
 +--> entity data
 |
 +--> entity document selection
 |
 v
entity/document-renderer.js
 |
 v
image-export.js
 |
 v
download / ZIP


Entity logic must not be mixed into Individual-specific
generation or rendering logic.


============================================================
PHOTO RULES
============================================================

Photos are shared export resources.

Final normalized photo requirements:

    Resolution:
        900 x 1200

    Format:
        JPEG

    Maximum size:
        STRICTLY LESS THAN 80 KB


80 KB itself is NOT accepted.

Valid:

    79.99 KB


Invalid:

    80.00 KB
    81 KB
    100 KB


The photo resolution must remain exactly:

    900 x 1200


If a photo cannot be compressed below 80 KB while retaining
the required 900 x 1200 resolution, generation must fail
instead of adding an oversized photo to the ZIP.


============================================================
DOCUMENT SIZE RULES
============================================================

Generated PAN and Aadhaar document images must remain below:

    80 KB


Image quality should be preserved as much as possible while
meeting the strict size requirement.


============================================================
COORDINATE SYSTEM
============================================================

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


============================================================
INDIVIDUAL COORDINATES
============================================================

These are the currently recorded template coordinates.

Do not change them as part of architecture refactoring.

PAN:

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


Aadhaar:

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


Aadhaar number:

    center x=800
    baseline y=690


NOTE:

Coordinates are document/template-specific.

When a template is replaced, coordinates must be verified
against the new template.


============================================================
COORDINATE PICKER
============================================================

document-renderer.js contains:

    enableCoordinatePicker(canvas)


Run:

    enableCoordinatePicker(
        document.getElementById("cardCanvas")
    );


Then click the template.

The browser console reports:

    Template coordinate -> X: 535, Y: 420


Use this to tune positions when a template changes.


============================================================
SERVER-SIDE / VERCEL RESOURCE INJECTION
============================================================

streamlit_app.py

Existing server-side entry point.

It loads/injects:

    HTML
    CSS
    JavaScript
    Excel template
    PAN template
    Aadhaar template
    server-side bulk photos


Binary resources may be converted to Base64 and injected into
the browser.

Existing browser variables include:

    window.PAN_TEMPLATE_BASE64
    window.AADHAAR_TEMPLATE_BASE64
    window.BULK_PHOTOS
    window.OCR_TEMPLATE_BASE64


Vercel deployment uses:

    vercel/build.js


The Vercel adapter may embed required static resources into
the generated deployment output.

Do not break the existing Vercel deployment while refactoring
the application.


============================================================
VERCEL RULE
============================================================

The current working Vercel deployment must remain functional.

Architecture changes should be tested in:

    scalable-individual


before merging into:

    vercel-deploy


or:

    main


Do not modify the stable branch only to experiment.


============================================================
IMPORTANT SEPARATION RULES
============================================================

Root:

    js/app.js
        = application entry/controller


Individual:

    js/individual/app.js
        = Individual application control

    js/individual/data-generator.js
        = Individual synthetic data

    js/individual/document-renderer.js
        = Individual document rendering


Entity:

    js/entity/app.js
        = Entity application control

    js/entity/data-generator.js
        = Entity synthetic data

    js/entity/document-renderer.js
        = Entity document rendering


Shared:

    js/image-export.js
        = shared image/export functionality


Templates:

    templates/
        = visual document backgrounds


Sample:

    sample/
        = Excel input templates


Do not mix these responsibilities.


============================================================
ADDING A NEW INDIVIDUAL DOCUMENT
============================================================

1. Add the template under the appropriate Individual folder.

2. Add document-specific data generation if required.

3. Add document-specific rendering configuration.

4. Add document-specific fields to the Individual UI if required.

5. Update the Individual Excel template if required.

6. Test:

    Manual generation
    Preview
    JPEG download
    Batch Excel
    Photo matching
    ZIP generation
    80 KB validation


Do not modify Entity code unless required by shared
functionality.


============================================================
ADDING A NEW ENTITY DOCUMENT
============================================================

1. Add the template under:

    templates/entity/


2. Choose the appropriate category:

    entity/id/

or:

    entity/certificates/


3. Add Entity-specific data generation.

4. Add Entity-specific rendering configuration.

5. Add Entity-specific UI fields.

6. Update:

    sample/entity-template.xlsx


7. Test:

    Manual generation
    Preview
    JPEG download
    Batch Excel
    Photo matching
    ZIP generation
    80 KB validation


Do not modify Individual document logic unless the change is
truly shared.


============================================================
ADDING OR REMOVING DOCUMENTS
============================================================

Documents should be independently manageable.

Adding a document should primarily require:

    Template
    Data fields
    Rendering configuration
    Document-specific generation
    Excel fields if required


Removing a document should not require rewriting unrelated
documents.


Avoid hardcoding one document's behaviour into another
document's implementation.


============================================================
CURRENT DESIGN PRINCIPLE
============================================================

The template is the design.

JavaScript only adds dynamic information:

    Name
    Parent Name
    DOB
    Gender
    PAN/Aadhaar number
    Photo


Future Entity documents follow the same principle:

    Template
        +
    Dynamic Entity data
        +
    Photo where applicable
        =
    Final test document


This makes future template changes easier than rebuilding
the complete visual document using canvas drawing commands.


============================================================
REFACTORING RULES
============================================================

The current working Individual implementation must not be
broken during refactoring.

Refactor incrementally.

For every structural change:

    1. Make one small change.
    2. Test Individual Manual.
    3. Test Individual Batch.
    4. Test PAN.
    5. Test Aadhaar.
    6. Test photo handling.
    7. Test ZIP generation.
    8. Test Vercel deployment where applicable.
    9. Commit only after validation.


Do not perform a large rewrite in one step.


============================================================
CURRENT DEVELOPMENT BRANCH
============================================================

Scalable architecture work is being performed on:

    scalable-individual


Stable branches:

    main
    vercel-deploy


Do not directly experiment on the stable branches.


============================================================
FUTURE TARGET
============================================================

The final application will support:

    Test Data Generator
          |
          +----------------------+
          |                      |
      Individual              Entity
          |                      |
      +---+---+             +----+----------------+
      |       |             |         |            |
     PAN   Aadhaar       Entity PAN  CIN   Registration
                                              Certificate


Both categories can support:

    Manual generation
    Bulk Excel generation
    Photo matching
    ZIP downloads


Shared export and image-processing functionality remains
shared.


============================================================
END OF PROJECT BRAIN
============================================================