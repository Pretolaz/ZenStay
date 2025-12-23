/**
 * Sidebar Manager - Centralized logic for loading and managing the sidebar
 */
export function initSidebar() {
    const sidebarContainer = document.getElementById("sidebar");
    if (!sidebarContainer) return;

    fetch("assets/components/sidebar.html")
        .then(res => res.text())
        .then(html => {
            sidebarContainer.innerHTML = html;
            setupSidebarLogic();
        })
        .catch(err => console.error("Erro ao carregar sidebar: ", err));
}

function setupSidebarLogic() {
    const body = document.body;
    const sidebarElement = document.querySelector('.sidebar');
    const menuToggleBtn = document.getElementById('menu-toggle');
    const headerToggleBtn = document.getElementById('header-menu-toggle');

    function toggleSidebar() {
        body.classList.toggle('sidebar-open-mobile');
    }

    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSidebar();
        });
    }

    if (headerToggleBtn) {
        headerToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSidebar();
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (body.classList.contains('sidebar-open-mobile') &&
            sidebarElement && !sidebarElement.contains(e.target) &&
            (!menuToggleBtn || !menuToggleBtn.contains(e.target)) &&
            (!headerToggleBtn || !headerToggleBtn.contains(e.target))) {
            toggleSidebar();
        }
    });

    // Active path logic & Submenu initialization
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('.sidebar a').forEach(link => {
        const href = link.getAttribute('href');

        // Check if this link is the current page
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
            link.classList.add('active');

            // Auto-expand parent submenu if child is active
            const parentSubmenu = link.closest('.submenu');
            if (parentSubmenu) {
                parentSubmenu.style.display = 'block';
                const parentHasSubmenu = parentSubmenu.closest('.has-submenu');
                if (parentHasSubmenu) {
                    parentHasSubmenu.classList.add('expanded');
                }
            }
        }

        // Close sidebar on link click (mobile)
        link.addEventListener('click', function () {
            if (window.innerWidth <= 768 && !this.classList.contains('submenu-toggle')) {
                body.classList.remove('sidebar-open-mobile');
            }
        });
    });

    // Submenu toggle listeners
    document.querySelectorAll('.submenu-toggle').forEach(toggle => {
        toggle.addEventListener('click', function (e) {
            e.preventDefault();
            const parentLi = this.closest('.has-submenu');
            if (!parentLi) return;

            parentLi.classList.toggle('expanded');
            const submenu = parentLi.querySelector('.submenu');
            if (submenu) {
                const isVisible = window.getComputedStyle(submenu).display === 'block';
                submenu.style.display = isVisible ? 'none' : 'block';
            }
        });
    });
}

// Auto-init if not imported as module or if explicitly requested
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // If the page doesn't use type="module" for its main logic, 
        // we can still auto-init if the sidebar div exists.
        // But for modules, they should call it explicitly.
    });
}
