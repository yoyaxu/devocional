"""Extract 365 reflections from raw text."""
import re
import json

# Read the already extracted text
with open('/home/z/my-project/download/raw_text.txt', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')

# Step 1: Extract the INDEX (all 365 titles with their numbers)
# Index lines look like: "Las pruebas......................................................10"
index_entries = []
for line in lines:
    line = line.strip()
    # Match index entries: text followed by dots and a number
    m = re.match(r'^(.+?)\.{2,}\s*(\d{1,3})$', line)
    if m:
        title = m.group(1).strip()
        page = int(m.group(2))
        if len(title) > 2 and page >= 10:  # Valid entry (starts at page 10)
            index_entries.append({'title': title, 'page': page})

# Some entries span two lines (like "Pecado como desobediencia a dios y\ntransgresión.......................206")
# Let's check and merge
merged = []
i = 0
while i < len(index_entries):
    entry = index_entries[i]
    # Check if this title is very short (might be continuation of previous)
    if merged and len(entry['title']) < 15 and not entry['title'][0].isupper():
        # Merge with previous
        merged[-1]['title'] += ' ' + entry['title']
        merged[-1]['page'] = entry['page']
    else:
        merged.append(entry)
    i += 1

index_entries = merged
print(f'Index entries found: {len(index_entries)}')
if index_entries:
    print(f'First: {index_entries[0]}')
    print(f'Last: {index_entries[-1]}')

# Step 2: Extract content from the reflections section
# Find where reflections start (after "INTRODUCCIÓN" section)
# From the raw text, reflections content starts after the intro
# Let's find page markers and extract content per page

# Split content by page markers
pages = {}
current_page = None
for line in lines:
    page_m = re.match(r'^--- PAGE (\d+) ---$', line.strip())
    if page_m:
        current_page = int(page_m.group(1))
        pages[current_page] = []
    elif current_page is not None:
        pages[current_page].append(line)

# Pages 10+ (1-indexed) contain the actual reflections
# Each page has 2 reflections with numbers
# Let's find reflection numbers and their content

# Extract from pages that have reflection content
reflexiones = []

# Process pages 10 onwards (where reflections start based on index)
for page_num in sorted(pages.keys()):
    if page_num < 10:
        continue
    page_lines = pages[page_num]
    page_text = '\n'.join(page_lines)
    
    # Find reflection numbers on this page (standalone numbers)
    for line in page_lines:
        stripped = line.strip()
        if re.match(r'^\d{1,3}$', stripped):
            num = int(stripped)
            if 1 <= num <= 365:
                # Find the matching index entry
                idx_entry = None
                for entry in index_entries:
                    if entry['page'] == page_num:
                        idx_entry = entry
                        break
                
                # Also try to find title from index by number
                # The index entries are sequential, so entry 0 = reflection 1, etc.
                idx = num - 1
                title = ''
                if idx < len(index_entries):
                    title = index_entries[idx]['title']
                
                reflexiones.append({
                    'number': num,
                    'title': title,
                    'page': page_num
                })
                break  # Only take first number per page for now

# Remove duplicates (each page has 2 reflections)
seen = set()
unique_reflexiones = []
for r in reflexiones:
    if r['number'] not in seen:
        seen.add(r['number'])
        unique_reflexiones.append(r)

unique_reflexiones.sort(key=lambda x: x['number'])
print(f'\nUnique reflections: {len(unique_reflexiones)}')

# Step 3: Build the final data structure
# Use index for titles, extract full page text for content
final_data = []
for i, entry in enumerate(index_entries):
    num = i + 1
    page = entry['page']
    page_text = '\n'.join(pages.get(page, []))
    
    # Clean page text - remove page markers
    page_text = re.sub(r'--- PAGE \d+ ---', '', page_text).strip()
    
    # Try to extract quote (text in quotes)
    quotes = re.findall(r'"([^"]+)"', page_text)
    quote = quotes[0] if quotes else ''
    
    final_data.append({
        'number': num,
        'title': entry['title'],
        'page': page,
        'quote': quote,
        'fullText': page_text
    })

print(f'Final data entries: {len(final_data)}')
print(f'Sample: #{final_data[0]["number"]} - {final_data[0]["title"]} (page {final_data[0]["page"]})')
print(f'Quote: {final_data[0]["quote"][:150]}...')

# Save
with open('/home/z/my-project/download/reflexiones.json', 'w', encoding='utf-8') as f:
    json.dump(final_data, f, ensure_ascii=False, indent=2)
print(f'\nSaved to /home/z/my-project/download/reflexiones.json')
