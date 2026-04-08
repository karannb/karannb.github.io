lines = open('styles/site.css').read().splitlines()
# truncate the dangling end brackets
good_lines = lines[:-5]
with open('styles/site.css', 'w') as f:
    f.write('\n'.join(good_lines) + '\n')
