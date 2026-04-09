document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    if (!themeToggle || !themeIcon) return;

    const currentTheme = localStorage.getItem('theme');
    
    if (currentTheme) {
        document.body.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') {
            themeIcon.className = 'fa-solid fa-sun';
        } else {
            themeIcon.className = 'fa-solid fa-moon';
        }
    }

    themeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        if (document.getElementById('theme-transition-overlay')) return; // prevent spamming

        const oldTheme = document.body.getAttribute('data-theme') || 'light';
        let targetTheme = oldTheme === 'light' ? 'dark' : 'light';

        // Rare easter-egg transition: mostly do the normal instant theme flip.
        const BLOCK_TRANSITION_PROBABILITY = 0.01; // 1%
        const USE_ANIMATION = Math.random() < BLOCK_TRANSITION_PROBABILITY;

        if (!USE_ANIMATION) {
            if (targetTheme === 'dark') {
                document.body.setAttribute('data-theme', 'dark');
                themeIcon.className = 'fa-solid fa-sun';
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.removeAttribute('data-theme');
                themeIcon.className = 'fa-solid fa-moon';
                localStorage.setItem('theme', 'light');
            }
            return;
        }

        // 1. Visually freeze the current page by cloning it into a full-screen overlay mask
        const overlay = document.createElement('div');
        overlay.id = 'theme-transition-overlay';
        const frozenViewportWidth = document.documentElement.clientWidth;
        const frozenViewportHeight = document.documentElement.clientHeight;
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = `${frozenViewportWidth}px`;
        overlay.style.height = `${frozenViewportHeight}px`;
        overlay.style.zIndex = '99999';
        overlay.style.pointerEvents = 'none';
        overlay.style.overflow = 'hidden';
        
        const clone = document.body.cloneNode(true);
        clone.id = '';
        const frozenScrollX = Math.round(window.scrollX);
        const frozenScrollY = Math.round(window.scrollY);
        
        clone.style.position = 'fixed';
        clone.style.top = '0';
        clone.style.left = '0';
        clone.style.margin = '0';
        clone.style.padding = '0';
        clone.style.boxSizing = 'border-box';
        clone.style.width = `${frozenViewportWidth}px`;
        clone.style.height = `${frozenViewportHeight}px`;
        clone.style.overflow = 'hidden';
        clone.style.transform = `translate(${-frozenScrollX}px, ${-frozenScrollY}px)`;
        
        clone.style.transition = 'none';
        const cloneElems = clone.querySelectorAll('*');
        for (let el of cloneElems) el.style.transition = 'none';

        overlay.appendChild(clone);
        document.documentElement.appendChild(overlay);

        // 2. Disable transitions on the real body temporarily and swap theme instantly!
        const realElems = document.body.querySelectorAll('*');
        const oldTransitions = [];
        const oldBodyTransition = document.body.style.transition;
        
        document.body.style.transition = 'none';
        for (let el of realElems) {
            oldTransitions.push(el.style.transition);
            el.style.transition = 'none';
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

        // 3. One frame later, reveal the new theme under the frozen clone using a block-mask spread.
        requestAnimationFrame(() => {
            const overlayWidth = overlay.clientWidth || window.innerWidth;
            const overlayHeight = overlay.clientHeight || window.innerHeight;
            const blockSize = 12;
            const cols = Math.ceil(overlayWidth / Math.max(1, blockSize));
            const rows = Math.ceil(overlayHeight / Math.max(1, blockSize));
            const totalBlocks = cols * rows;

            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = cols;
            maskCanvas.height = rows;
            const ctx = maskCanvas.getContext('2d', { willReadFrequently: true });

            if (!ctx) {
                overlay.remove();
                document.body.style.transition = oldBodyTransition;
                let i = 0;
                for (let el of realElems) {
                    if (i < oldTransitions.length) el.style.transition = oldTransitions[i];
                    i++;
                }
                return;
            }

            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, cols, rows);

            const applyMask = () => {
                const dataUrl = maskCanvas.toDataURL();
                overlay.style.maskImage = `url(${dataUrl})`;
                overlay.style.webkitMaskImage = `url(${dataUrl})`;
                overlay.style.maskSize = '100% 100%';
                overlay.style.webkitMaskSize = '100% 100%';
                overlay.style.maskRepeat = 'no-repeat';
                overlay.style.webkitMaskRepeat = 'no-repeat';
                overlay.style.maskPosition = '0 0';
                overlay.style.webkitMaskPosition = '0 0';
                overlay.style.imageRendering = 'pixelated';
            };

            applyMask();

            const lit = new Uint8Array(totalBlocks);
            let frontier = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];

            for (let i = 0; i < 3; i++) {
                frontier.push({ x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) });
            }

            for (let f of frontier) lit[f.y * cols + f.x] = 1;
            let litCount = frontier.length;

            const cleanup = () => {
                if (overlay.parentNode) overlay.remove();
                document.body.style.transition = oldBodyTransition;
                let i = 0;
                for (let el of realElems) {
                    if (i < oldTransitions.length) el.style.transition = oldTransitions[i];
                    i++;
                }
            };

            function drawStep() {
                if (litCount >= totalBlocks) {
                    cleanup();
                    return;
                }

                let newFrontier = [];
                let updated = false;

                for (let i = 0; i < frontier.length; i++) {
                    const p = frontier[i];

                    ctx.clearRect(p.x, p.y, 1, 1);
                    updated = true;

                    const neighbors = [
                        { x: p.x + 1, y: p.y },
                        { x: p.x - 1, y: p.y },
                        { x: p.x, y: p.y + 1 },
                        { x: p.x, y: p.y - 1 }
                    ];

                    let hasUnlit = false;
                    for (let n of neighbors) {
                        if (n.x >= 0 && n.x < cols && n.y >= 0 && n.y < rows) {
                            const idx = n.y * cols + n.x;
                            if (lit[idx] === 0) {
                                hasUnlit = true;
                                if (Math.random() < 0.3) {
                                    lit[idx] = 1;
                                    litCount++;
                                    newFrontier.push(n);
                                }
                            }
                        }
                    }

                    if (Math.random() < 0.02) {
                        const rx = Math.floor(Math.random() * cols);
                        const ry = Math.floor(Math.random() * rows);
                        const rIdx = ry * cols + rx;
                        if (lit[rIdx] === 0) {
                            lit[rIdx] = 1;
                            litCount++;
                            newFrontier.push({ x: rx, y: ry });
                        }
                    }

                    if (hasUnlit && Math.random() < 0.8) {
                        newFrontier.push(p);
                    }
                }

                if (litCount > totalBlocks * 0.8) {
                    for (let i = 0; i < totalBlocks; i++) {
                        if (lit[i] === 0 && Math.random() < 0.2) {
                            const r = Math.floor(i / cols);
                            const c = i % cols;
                            lit[i] = 1;
                            litCount++;
                            ctx.clearRect(c, r, 1, 1);
                            updated = true;
                        }
                    }
                }

                if (updated) applyMask();

                frontier = newFrontier;
                requestAnimationFrame(drawStep);
            }

            drawStep();
        });
    });
});
