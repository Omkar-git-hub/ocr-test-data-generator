import base64,json
from pathlib import Path
import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(page_title="D Card Generator",page_icon="🧪",layout="wide",initial_sidebar_state="collapsed")
BASE_DIR=Path(__file__).resolve().parent
INDEX_FILE=BASE_DIR/"index.html"
CSS_FILE=BASE_DIR/"css"/"style.css"
JS_FILES=[BASE_DIR/"js"/"data-generator.js",BASE_DIR/"js"/"document-renderer.js",BASE_DIR/"js"/"image-export.js",BASE_DIR/"js"/"app.js"]
TEMPLATE_FILE=BASE_DIR/"sample"/"ocr-test-data-template.xlsx"
PHOTO_DIR=BASE_DIR/"BulkUpload_photos"
SUPPORTED={".jpg",".jpeg",".png",".webp",".gif"}
required=[INDEX_FILE,CSS_FILE,TEMPLATE_FILE,*JS_FILES]
missing=[str(p.relative_to(BASE_DIR)) for p in required if not p.exists()]
if missing:
    st.error("Required project files are missing:")
    for p in missing: st.code(p)
    st.stop()
PHOTO_DIR.mkdir(parents=True,exist_ok=True)
def image_to_data_url(path):
    mime={".jpg":"image/jpeg",".jpeg":"image/jpeg",".png":"image/png",".webp":"image/webp",".gif":"image/gif"}.get(path.suffix.lower(),"application/octet-stream")
    return f"data:{mime};base64,{base64.b64encode(path.read_bytes()).decode('utf-8')}"
bulk_photos={}
for p in sorted(PHOTO_DIR.iterdir()):
    if p.is_file() and p.suffix.lower() in SUPPORTED:
        try: bulk_photos[p.name]=image_to_data_url(p)
        except Exception: pass
html=INDEX_FILE.read_text(encoding="utf-8")
css=CSS_FILE.read_text(encoding="utf-8")
js="\n".join(f"// ===== {p.name} =====\n{p.read_text(encoding='utf-8')}" for p in JS_FILES)
template_base64=base64.b64encode(TEMPLATE_FILE.read_bytes()).decode("utf-8")
html=html.replace('<link rel="stylesheet" href="css/style.css">',"").replace('<script src="js/data-generator.js"></script>',"").replace('<script src="js/document-renderer.js"></script>',"").replace('<script src="js/image-export.js"></script>',"").replace('<script src="js/app.js"></script>',"")
final_html=f'''<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>D Card Generator</title><script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script><script src="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"></script><style>{css}</style></head><body>{html}<script>window.OCR_TEMPLATE_BASE64="{template_base64}";window.BULK_PHOTOS={json.dumps(bulk_photos)};window.BULK_PHOTO_COUNT={len(bulk_photos)};</script><script>{js}</script></body></html>'''
components.html(final_html,height=1050,scrolling=True)
