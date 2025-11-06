// Alternância de tema (mantém salvo entre páginas)
document.getElementById('toggle-theme').addEventListener('click', () => {
    const theme = document.getElementById('theme-style');
    const isDark = theme.getAttribute('href').includes('dark');
    theme.setAttribute('href', isDark ? 'theme/light.css' : 'theme/dark.css');
    localStorage.setItem('zenstay-theme', isDark ? 'light' : 'dark');
});

window.addEventListener('DOMContentLoaded', () => {
    // Mantém tema salvo
    const saved = localStorage.getItem('zenstay-theme');
    if (saved) {
        document.getElementById('theme-style').setAttribute('href', `theme/${saved}.css`);
    }

    // The sidebar related JS is moved to the fetch block in index.html
});