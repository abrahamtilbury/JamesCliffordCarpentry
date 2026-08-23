"use strict";

(() => {
    const menuButton = document.querySelector(".menu-button");
    const mobileMenu = document.getElementById("mobile-menu");

    if (!menuButton || !mobileMenu) {
        return;
    }

    const desktopQuery = window.matchMedia("(min-width: 721px)");

    const isMenuOpen = () =>
        menuButton.getAttribute("aria-expanded") === "true";

    const openMenu = () => {
        mobileMenu.classList.add("open");
        menuButton.setAttribute("aria-expanded", "true");
        menuButton.setAttribute("aria-label", "Close navigation");
    };

    const closeMenu = ({ returnFocus = false } = {}) => {
        mobileMenu.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation");

        if (returnFocus) {
            menuButton.focus();
        }
    };

    menuButton.addEventListener("click", () => {
        if (isMenuOpen()) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    mobileMenu.addEventListener("click", (event) => {
        if (event.target.closest("a")) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && isMenuOpen()) {
            closeMenu({ returnFocus: true });
        }
    });

    document.addEventListener("click", (event) => {
        if (
            isMenuOpen() &&
            !menuButton.contains(event.target) &&
            !mobileMenu.contains(event.target)
        ) {
            closeMenu();
        }
    });

    const handleDesktopChange = (event) => {
        if (event.matches) {
            closeMenu();
        }
    };

    if (typeof desktopQuery.addEventListener === "function") {
        desktopQuery.addEventListener("change", handleDesktopChange);
    } else {
        desktopQuery.addListener(handleDesktopChange);
    }
})();

(() => {
    const reviewItems = document.querySelectorAll(".review-item");

    if (reviewItems.length < 2) {
        return;
    }

    reviewItems.forEach((item) => {
        item.addEventListener("toggle", () => {
            if (!item.open) {
                return;
            }

            reviewItems.forEach((otherItem) => {
                if (otherItem !== item && otherItem.open) {
                    otherItem.open = false;
                }
            });
        });
    });
})();
