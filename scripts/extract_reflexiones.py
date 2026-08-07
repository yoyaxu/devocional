"""Extract all 365 reflections from the PDF into a structured JSON file."""
import pdfplumber
import json
import re

pdf_path = '/home/z/my-project/upload/365_Reflexiones31.pdf'
output_path = '/home/z/my-project/download/reflexiones.json'

reflexiones = []

with pdfplumber.open(pdf_path) as pdf:
    print(f"Total pages: {len(pdf.pages)}")
    all_text = ""
    for i, page in enumerate(pdf.pages):
        text = page.extract_text()
        if text:
            all_text += f"\n--- PAGE {i+1} ---\n" + text
    
    # Save raw text for reference
    with open('/home/z/my-project/download/raw_text.txt', 'w', encoding='utf-8') as f:
        f.write(all_text)
    print(f"Raw text saved: {len(all_text)} chars")
    
    # Parse reflections from pages 7 onwards (index 6+)
    # Each reflection has: number, title, quote (in quotes), body
    current_number = None
    current_title = None
    current_quote = None
    current_body = ""
    
    for i in range(6, len(pdf.pages)):
        text = pdf.pages[i].extract_text()
        if not text:
            continue
        
        lines = text.split('\n')
        
        for line in lines:
            line_stripped = line.strip()
            if not line_stripped:
                continue
            
            # Check if line is a standalone number (reflection number)
            num_match = re.match(r'^(\d{1,3})$', line_stripped)
            if num_match:
                # Save previous reflection if exists
                if current_number is not None and (current_body.strip() or current_quote):
                    reflexiones.append({
                        "number": current_number,
                        "title": current_title or f"Reflexion {current_number}",
                        "quote": current_quote or "",
                        "body": current_body.strip()
                    })
                
                current_number = int(num_match.group(1))
                current_title = None
                current_quote = None
                current_body = ""
                continue
            
            if current_number is not None:
                # First non-number, non-empty line after number is likely the title
                if current_title is None:
                    current_title = line_stripped
                elif line_stripped.startswith('"') or line_stripped.startswith('\u201c'):
                    if current_quote is None:
                        current_quote = line_stripped
                    else:
                        current_quote += ' ' + line_stripped
                else:
                    current_body += line_stripped + ' '
    
    # Save last reflection
    if current_number is not None and (current_body.strip() or current_quote):
        reflexiones.append({
            "number": current_number,
            "title": current_title or f"Reflexion {current_number}",
            "quote": current_quote or "",
            "body": current_body.strip()
        })

print(f"\nExtracted {len(reflexiones)} reflections")
if reflexiones:
    print(f"First: #{reflexiones[0]['number']} - {reflexiones[0]['title']}")
    print(f"Last:  #{reflexiones[-1]['number']} - {reflexiones[-1]['title']}")
    print(f"Sample: {reflexiones[0].get('quote','')[:120]}...")
    print(f"Body: {reflexiones[0].get('body','')[:200]}...")

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(reflexiones, f, ensure_ascii=False, indent=2)
print(f"Saved to {output_path}")
