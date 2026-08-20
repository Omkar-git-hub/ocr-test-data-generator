# D Card Generator

Synthetic PAN and Aadhaar-style test-document generator for OCR and automation testing.

## Batch workflow
1. Download the sample Excel template.
2. Fill `Name, DOB, Gender, Address, ParentName, Photo`; optional `PAN` and `Aadhaar` columns can be supplied.
3. Upload the Excel file.
4. Upload multiple photos or a ZIP. The `Photo` value must match the uploaded filename.
5. If PAN/Aadhaar is blank, a synthetic test identifier is generated.
6. Export PAN, Aadhaar, or combined ZIP files.

The generated documents are intentionally marked as synthetic and are not official identity documents.
