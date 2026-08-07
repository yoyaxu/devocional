"""Fast extraction of 365 reflections using pypdf."""
import pypdf
import json
import re
import sys

pdf_path = '/home/z/my-project/upload/365_Reflexiones31.pdf'
output_path = '/home/z/my-project/download/reflexiones.json'

reader = pypdf.PdfReader(pdf_path)
print(f'Pages: {len(reader.pages)}', flush=True)

# Extract text page by page, save incrementally
all_text = ''
for i in range(len(reader.pages)):
    t = reader.pages[i].extract_text()
    if t:
        all_text += f'\n--- PAGE {i+1} ---\n' + t
    if (i + 1) % 20 == 0:
        print(f'  Processed {i+1}/{len(reader.pages)} pages...', flush=True)

with open('/home/z/my-project/download/raw_text.txt', 'w', encoding='utf-8') as f:
    f.write(all_text)
print(f'Total chars: {len(all_text)}', flush=True)

# Now parse reflections
# From the sample, structure seems to be:
# Two numbers on one line like "12 13" then each reflection follows
# Or single number per reflection
# Pattern: NUMBER then TITLE then "QUOTE" then body text

lines = all_text.split('\n')
reflexiones = []

i = 0
while i < len(lines):
    line = lines[i].strip()
    
    # Skip page markers and empty lines
    if not line or line.startswith('--- PAGE'):
        i += 1
        continue
    
    # Try to match a reflection number (1-365)
    # Could be standalone like "1" or paired like "12 13"
    num_match = re.match(r'^(\d{1,3})\s+(\d{1,3})?$', line)
    if num_match:
        num = int(num_match.group(1))
        
        # Collect title (next non-empty line that's not a number)
        title = ''
        quote = ''
        body = ''
        
        j = i + 1
        # Skip empty lines
        while j < len(lines) and not lines[j].strip():
            j += 1
        
        if j < len(lines):
            # Check if next line could be a title (not starting with quote, not a page marker, not a number)
            next_line = lines[j].strip()
            if next_line and not next_line.startswith('"') and not next_line.startswith('\u201c') and not re.match(r'^\d{1,3}$', next_line) and not next_line.startswith('--- PAGE'):
                title = next_line
                j += 1
                # Skip empty lines after title
                while j < len(lines) and not lines[j].strip():
                    j += 1
        
        if j < len(lines):
            # Check for quote (starts with ")
            next_line = lines[j].strip()
            if next_line.startswith('"') or next_line.startswith('\u201c'):
                # Collect all quote lines
                quote_parts = []
                while j < len(lines):
                    ql = lines[j].strip()
                    if ql.startswith('"') or ql.startswith('\u201c') or (quote_parts and ql and not re.match(r'^\d{1,3}\s*(\d{1,3})?$', ql) and not ql.startswith('--- PAGE')):
                        quote_parts.append(ql)
                        j += 1
                    else:
                        break
                quote = ' '.join(quote_parts)
        
        # Rest is body until next number or page marker
        body_parts = []
        while j < len(lines):
            bl = lines[j].strip()
            if bl.startswith('--- PAGE') or re.match(r'^(\d{1,3})\s+(\d{1,3})?$', bl):
                break
            if bl:
                body_parts.append(bl)
            j += 1
        body = ' '.join(body_parts)
        
        reflexiones.append({
            'number': num,
            'title': title,
            'quote': quote,
            'body': body
        })
        
        i = j
    else:
        i += 1

print(f'\nExtracted {len(reflexiones)} reflections', flush=True)
if reflexiones:
    print(f'First: #{reflexiones[0]["number"]} - {reflexiones[0]["title"]}', flush=True)
    print(f'Last:  #{reflexiones[-1]["number"]} - {reflexiones[-1]["title"]}', flush=True)
    # Show a sample
    r = reflexiones[0]
    print(f'\nSample reflection:'),
    print(f'  Quote: {r["quote"][:150]}...' if len(r['quote']) > 150 else f'  Quote: {r["quote"]}')
    print(f'  Body: {r["body"][:200]}...' if len(r['body']) > 200 else f'  Body: {r["body"]}')

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(reflexiones, f, ensure_ascii=False, indent=2)
print(f'Saved to {output_path}', flush=True)
