import re, json

with open('/home/z/my-project/download/raw_text.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Step 1: Parse index entries
index_entries = []
for line in text.split('\n'):
    m = re.match(r'^(.+?)\.{2,}\s*(\d{1,3})\s*$', line.strip())
    if m:
        title = m.group(1).strip()
        page = int(m.group(2))
        if page >= 10:
            index_entries.append({'title': title, 'page': page})

print(f'Index entries: {len(index_entries)}')

# Step 2: Split by form feed and parse reflection pages
pages = text.split('\x0c')
print(f'Pages: {len(pages)}')

all_parsed = []
for page_text in pages:
    lines = page_text.strip().split('\n')
    if not lines:
        continue
    
    # Check if this page starts with reflection numbers
    first_line = lines[0].strip()
    if not re.match(r'^\d{1,3}$', first_line):
        continue
    
    ref_num1 = int(first_line)
    if ref_num1 > 365 or ref_num1 < 1:
        continue
    
    # Find second reflection number (should be within first 5 lines)
    ref_num2 = None
    for l in lines[1:5]:
        l = l.strip()
        if re.match(r'^\d{1,3}$', l):
            ref_num2 = int(l)
            break
    
    if ref_num2 is None:
        continue
    
    # Find titles (non-numeric, non-empty, non-quote lines)
    titles = []
    for l in lines[1:20]:
        l = l.strip()
        if l and not re.match(r'^\d{1,3}$', l) and not l.startswith('"'):
            titles.append(l)
    
    # Extract quotes (text between "...")
    quotes = re.findall(r'"([^"]+)"', page_text)
    
    # Body text is everything after titles and quotes
    body = page_text
    # Remove first few structural lines
    body_lines = []
    past_titles = False
    title_count = 0
    for l in lines:
        l = l.strip()
        if not past_titles and l and not re.match(r'^\d{1,3}$', l) and not l.startswith('"'):
            title_count += 1
            if title_count >= 2:
                past_titles = True
            continue
        if past_titles and l:
            body_lines.append(l)
    body = ' '.join(body_lines)
    
    title1 = titles[0] if len(titles) > 0 else ''
    title2 = titles[1] if len(titles) > 1 else ''
    quote1 = quotes[0] if len(quotes) > 0 else ''
    quote2 = quotes[1] if len(quotes) > 1 else ''
    
    # Split body roughly in half for two reflections
    mid = len(body_lines) // 2
    body1 = ' '.join(body_lines[:mid])
    body2 = ' '.join(body_lines[mid:])
    
    all_parsed.append({
        'number': ref_num1,
        'title': title1,
        'quote': quote1,
        'body': body1
    })
    all_parsed.append({
        'number': ref_num2,
        'title': title2,
        'quote': quote2,
        'body': body2
    })

print(f'Parsed reflections: {len(all_parsed)}')

# Deduplicate by number
by_num = {}
for r in all_parsed:
    by_num[r['number']] = r

print(f'Unique: {len(by_num)}')
with_q = sum(1 for r in by_num.values() if r['quote'])
print(f'With quotes: {with_q}')

if by_num:
    first = by_num[1]
    print(f'\n#1: {first["title"]}')
    print(f'Quote: {first["quote"][:150]}...' if first['quote'] else 'No quote')
    print(f'Body: {first["body"][:200]}...')

# Build final: use index for titles (more reliable), content for quotes/body
final = []
for i, entry in enumerate(index_entries):
    num = i + 1
    content = by_num.get(num, {})
    final.append({
        'number': num,
        'title': entry['title'],
        'quote': content.get('quote', ''),
        'body': content.get('body', '')
    })

with open('/home/z/my-project/download/reflexiones.json', 'w', encoding='utf-8') as f:
    json.dump(final, f, ensure_ascii=False, indent=2)
print(f'\nSaved {len(final)} reflections to reflexiones.json')
