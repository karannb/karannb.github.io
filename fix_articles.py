import glob

html_files = glob.glob('articles/*.html')

for file in html_files:
    with open(file, 'r') as f:
        content = f.read()
    
    # 1. Add FontAwesome if not exists
    if 'font-awesome' not in content:
        content = content.replace('</head>', '    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">\n</head>')
    
    # 2. Add theme toggle at start of body. We look for <body class="article-page">
    if 'theme-toggle-btn' not in content:
        content = content.replace('<body class="article-page">', '<body class="article-page">\n    <a href="#" id="theme-toggle" class="theme-toggle-btn" title="Toggle Dark/Light Mode" style="position: absolute; top: 20px; left: 20px;"><i id="theme-icon" class="fa-solid fa-moon"></i></a>')
    
    # 3. Add script at the end of body
    script_str = """
    <!-- Script to Handle Theme Toggling -->
    <script>
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme) {
            document.body.setAttribute('data-theme', currentTheme);
            if (currentTheme === 'dark') {
                themeIcon.className = 'fa-solid fa-sun';
            }
        }
        themeToggle.addEventListener('click', (e) => {
            e.preventDefault(); 
            let targetTheme = 'light';
            if (document.body.getAttribute('data-theme') !== 'dark') {
                targetTheme = 'dark';
            }
            if (targetTheme === 'dark') {
                document.body.setAttribute('data-theme', 'dark');
                themeIcon.className = 'fa-solid fa-sun';
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.removeAttribute('data-theme');
                themeIcon.className = 'fa-solid fa-moon';
                localStorage.setItem('theme', 'light');
            }
        });
    </script>
</body>"""
    if 'themeToggle = document.getElementById(' not in content:
        content = content.replace('</body>', script_str)
        
    with open(file, 'w') as f:
        f.write(content)

