"use strict";

/* =========================================================
   10.10 - MOBILE NAVIGATION
========================================================= */

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

/* =========================================================
   20.10 - SHARED GALLERY SYSTEM
   Service images + client reviews
========================================================= */

(() => {

    const galleryCards =
        Array.from(
            document.querySelectorAll(
                "[data-service-gallery], [data-review-gallery]"
            )
        );

    if (!galleryCards.length) {
        return;
    }

    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

    const galleries = [];

    galleryCards.forEach(card => {

        const track =
            card.querySelector(
                "[data-gallery-track]"
            );

        const slides =
            Array.from(
                card.querySelectorAll(
                    ".service-gallery-slide, .review-gallery-slide"
                )
            );

        const toggles =
            Array.from(
                card.querySelectorAll(
                    "[data-gallery-toggle]"
                )
            );
        
        const alwaysOpen =
            card.hasAttribute(
                "data-gallery-always-open"
            );

        const isReviewGallery =
            card.hasAttribute(
                "data-review-gallery"
            );

        const previousButton =
            card.querySelector(
                "[data-gallery-prev]"
            );

        const nextButton =
            card.querySelector(
                "[data-gallery-next]"
            );

        const currentCounter =
            card.querySelector(
                "[data-gallery-current]"
            );

        const totalCounter =
            card.querySelector(
                "[data-gallery-total]"
            );

        if (
            !track ||
            !slides.length ||
            (!alwaysOpen && !toggles.length) ||
            (!isReviewGallery && !previousButton) ||
            !nextButton ||
            !currentCounter ||
            !totalCounter
        ) {
            return;
        }

        let currentIndex = 0;

        let scrollFrame = null;

        /* =============================
            20.11 - LAZY GALLERY IMAGES
        ============================= */

        /*
        * Large service-gallery assets are only
        * requested once that service is expanded.
        *
        * Review galleries contain no gallery
        * images, so this safely does nothing there.
        */

        const loadGalleryImages = () => {

            const images =
                card.querySelectorAll(
                    "img[data-gallery-src]"
                );

            images.forEach(image => {

                const source =
                    image.dataset.gallerySrc;

                if (!source) {
                    return;
                }

                image.loading = "eager";
                image.src = source;
                image.removeAttribute(
                    "data-gallery-src"
                );
            });
        };
        
        /* ==========================
            20.12 - INTERFACE STATE
        ========================== */

        const updateInterface = () => {

            currentCounter.textContent =
                String(
                    currentIndex + 1
                );

            totalCounter.textContent =
                String(
                    slides.length
                );

            slides.forEach(
                (slide, index) => {

                    slide.setAttribute(
                        "aria-hidden",

                        index === currentIndex
                            ? "false"
                            : "true"
                    );
                    
                    if (
                        isReviewGallery &&
                        index !== currentIndex
                    ) {

                        slide
                            .querySelectorAll(
                                ".review-text-details[open]"
                            )
                            .forEach(details => {

                                details.removeAttribute(
                                    "open"
                                );
                            });

                        slide
                            .querySelectorAll(
                                "[data-review-photo-gallery].is-photo-open"
                            )
                            .forEach(photoGallery => {

                                photoGallery.dispatchEvent(
                                    new Event(
                                        "review-photo-close"
                                    )
                                );
                            });
                    }
                }
            );
        };

        /* ==========================
            20.13 - GALLERY STATE
        ========================== */

        const setExpanded =
            expanded => {

                card.classList.toggle(
                    "is-gallery-open",
                    expanded
                );

                toggles.forEach(toggle => {

                    toggle.setAttribute(
                        "aria-expanded",
                        String(expanded)
                    );

                    if (
                        toggle.tagName ===
                        "BUTTON"
                    ) {

                        const label =
                            expanded
                                ? toggle.dataset.labelClose
                                : toggle.dataset.labelOpen;

                        if (label) {

                            toggle.setAttribute(
                                "aria-label",
                                label
                            );
                        }
                    }
                });
            };

        const goToSlide = (
            index,
            behavior =
                reducedMotion.matches
                    ? "auto"
                    : "smooth"
        ) => {

            currentIndex =
                (
                    index +
                    slides.length
                ) %
                slides.length;
            track.scrollTo({
                left:
                    currentIndex *
                    track.clientWidth,
                behavior
            });
            updateInterface();
        };

        const closeGallery = () => {
            if (alwaysOpen) {
                return;
            }
            setExpanded(false);

            currentIndex = 0;

            track.scrollTo({
                left: 0,
                behavior: "auto"
            });

            updateInterface();

        };

        const openGallery = () => {

            /*
            * Preserve the clicked module's
            * position in the viewport.
            */

            const originalTop =
                card.getBoundingClientRect().top;

            /*
            * Only one expandable service gallery
            * is open at a time.
            *
            * Always-open galleries, such as
            * testimonials, are not added here.
            */

            galleries.forEach(gallery => {
                if (
                    gallery.card !== card
                ) {
                    gallery.close();
                }
            });

            loadGalleryImages();

            setExpanded(true);

            requestAnimationFrame(() => {

                goToSlide(
                    0,
                    "auto"
                );

                const newTop =
                    card.getBoundingClientRect().top;

                const movement =
                    newTop - originalTop;
                if (
                    Math.abs(movement) > 1
                ) {
                    window.scrollBy({
                        top: movement,
                        behavior: "auto"
                    });
                }
            });
        };

        /* ==========================
            20.14 - BUTTON CONTROLS
        ========================== */

        toggles.forEach(toggle => {

            toggle.addEventListener(
                "click",
                event => {
                    /*
                    * The Services-page href
                    * remains a valid no-JS
                    * fallback.
                    */
                    if (
                        toggle.tagName ===
                        "A"
                    ) {
                        event.preventDefault();

                    }
                    const isOpen =
                        card.classList.contains(
                            "is-gallery-open"
                        );
                    if (isOpen) {
                        closeGallery();
                    } else {
                        openGallery();
                    }
                }
            );
        });

        if (previousButton) {

            previousButton.addEventListener(
                "click",
                () => {
                    goToSlide(
                        currentIndex - 1
                    );
                }
            );
        }

        nextButton.addEventListener(
            "click",
            () => {
                goToSlide(
                    currentIndex + 1
                );
            }
        );

        /* ==========================
            20.15 - SWIPE / SCROLL
        ========================== */

        /*
        * Keep the counter and active slide
        * synchronized after manual swiping.
        */

        track.addEventListener(
            "scroll",
            () => {

                if (
                    !card.classList.contains(
                        "is-gallery-open"
                    )
                ) {
                    return;
                }

                if (scrollFrame) {

                    cancelAnimationFrame(
                        scrollFrame
                    );
                }

                scrollFrame =
                    requestAnimationFrame(
                        () => {

                            const width =
                                track.clientWidth;

                            if (!width) {
                                return;
                            }

                            currentIndex =
                                Math.max(
                                    0,
                                    Math.min(
                                        Math.round(
                                            track.scrollLeft /
                                            width
                                        ),
                                        slides.length - 1
                                    )
                                );
                            updateInterface();
                        }
                    );
            },
            {
                passive: true
            }
        );

        /* ==========================
            20.16 - KEYBOARD NAVIGATION
        ========================== */

        track.addEventListener(
            "keydown",
            event => {

                if (
                    !card.classList.contains(
                        "is-gallery-open"
                    )
                ) {
                    return;
                }

                if (
                    event.key ===
                    "ArrowLeft"
                ) {

                    event.preventDefault();

                    goToSlide(
                        currentIndex - 1
                    );
                }

                if (
                    event.key ===
                    "ArrowRight"
                ) {
                    event.preventDefault();

                    goToSlide(
                        currentIndex + 1
                    );
                }

                if (
                    event.key ===
                        "Escape" &&
                    !alwaysOpen
                ) {
                    event.preventDefault();
                    closeGallery();
                }
            }
        );

        /* ==========================
            20.17 - RESIZE HANDLING
        ========================== */

        /*
        * Realign the active slide after
        * orientation or viewport changes.
        */

        window.addEventListener(
            "resize",
            () => {
                if (
                    !card.classList.contains(
                        "is-gallery-open"
                    )
                ) {
                    return;
                }
                goToSlide(
                    currentIndex,
                    "auto"
                );
            }
        );

        /* ==========================
            20.18 - INITIALISATION
        ========================== */

        if (alwaysOpen) {
            card.classList.add(
                "is-gallery-open"
            );
        }

        updateInterface();

        if (!alwaysOpen) {
            galleries.push({
                card,
                close: closeGallery
            });
        }
    });
})();

/* =========================================================
   30.10 - REVIEW PHOTO VIEWER
========================================================= */

(() => {

    const photoGalleries =
        Array.from(
            document.querySelectorAll(
                "[data-review-photo-gallery]"
            )
        );

    if (!photoGalleries.length) {
        return;
    }

    photoGalleries.forEach(gallery => {

        const openButton =
            gallery.querySelector(
                "[data-review-photo-open]"
            );

        const viewer =
            gallery.querySelector(
                "[data-review-photo-viewer]"
            );

        const closeButton =
            gallery.querySelector(
                "[data-review-photo-close]"
            );

        const previousButton =
            gallery.querySelector(
                "[data-review-photo-prev]"
            );

        const nextButton =
            gallery.querySelector(
                "[data-review-photo-next]"
            );

        const currentCounter =
            gallery.querySelector(
                "[data-review-photo-current]"
            );

        const slides =
            Array.from(
                gallery.querySelectorAll(
                    "[data-review-photo-slide]"
                )
            );

        const reviewGallery =
            gallery.closest(
                "[data-review-gallery]"
            );

        if (
            !openButton ||
            !viewer ||
            !closeButton ||
            !previousButton ||
            !nextButton ||
            !currentCounter ||
            !slides.length
        ) {
            return;
        }

        let currentIndex = 0;

        const updateViewer = () => {
            slides.forEach(
                (slide, index) => {

                    const isActive =
                        index === currentIndex;

                    slide.classList.toggle(
                        "is-active",
                        isActive
                    );

                    slide.setAttribute(
                        "aria-hidden",
                        String(!isActive)
                    );
                }
            );

            currentCounter.textContent =
                String(
                    currentIndex + 1
                );
        };

        const goToPhoto = index => {
            currentIndex =
                (
                    index +
                    slides.length
                ) %
                slides.length;

            updateViewer();
        };

        const openViewer = () => {

            currentIndex = 0;

            updateViewer();

            viewer.hidden = false;

            gallery.classList.add(
                "is-photo-open"
            );

            openButton.setAttribute(
                "aria-expanded",
                "true"
            );

            closeButton.focus({
                preventScroll: true
            });
        };

        const closeViewer =
            ({
                returnFocus = true
            } = {}) => {
                
                gallery.classList.remove(
                    "is-photo-open"
                );

                viewer.hidden = true;
                openButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

                if (returnFocus) {
                    openButton.focus({
                        preventScroll: true
                    });
                }
            };

        openButton.addEventListener(
            "click",
            openViewer
        );

        closeButton.addEventListener(
            "click",
            () => {
                closeViewer();
            }
        );

        gallery.addEventListener(
            "review-photo-close",
            () => {

                const focusWasInside =
                    viewer.contains(
                        document.activeElement
                    );

                closeViewer({
                    returnFocus: false
                });

                if (focusWasInside) {

                    reviewGallery
                        ?.querySelector(
                            "[data-gallery-track]"
                        )
                        ?.focus({
                            preventScroll: true
                        });
                }
            }
        );

        previousButton.addEventListener(
            "click",
            () => {
                goToPhoto(
                    currentIndex - 1
                );
            }
        );

        nextButton.addEventListener(
            "click",
            () => {
                goToPhoto(
                    currentIndex + 1
                );
            }
        );

        viewer.addEventListener(
            "keydown",
            event => {

                if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    event.stopPropagation();
                    goToPhoto(
                        currentIndex - 1
                    );
                }

                if (event.key === "ArrowRight") {
                    event.preventDefault();
                    event.stopPropagation();
                    goToPhoto(
                        currentIndex + 1
                    );
                }
                if (event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();
                    closeViewer();
                }
            }
        );
        updateViewer();
    });
})();