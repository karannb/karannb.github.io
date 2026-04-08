import glob, re

for file in glob.glob('articles/*.html'):
    with open(file, 'r') as f:
        content = f.read()
    
    # Strip some specific inline styles that ruin formatting
    content = re.sub(r' style="margin-bottom:[^"]+"', '', content)
    content = re.sub(r' style="margin-top:[^"]+"', '', content)
    
    with open(file, 'w') as f:
        f.write(content)
