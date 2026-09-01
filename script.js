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
    const galleryCards =
        Array.from(
            document.querySelectorAll(
                "[data-service-gallery]"
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
                    ".service-gallery-slide"
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
            !previousButton ||
            !nextButton ||
            !currentCounter ||
            !totalCounter
        ) {
            return;
        }

        let currentIndex = 0;

        let scrollFrame = null;


        /*
         * Large gallery assets are only
         * requested once this particular
         * service has been expanded.
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

                }
            );

        };


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
             * Only one service is expanded.
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


        previousButton.addEventListener(
            "click",
            () => {

                goToSlide(
                    currentIndex - 1
                );

            }
        );


        nextButton.addEventListener(
            "click",
            () => {

                goToSlide(
                    currentIndex + 1
                );

            }
        );


        /*
         * Finger swipe counter update.
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


        /*
         * Keyboard navigation.
         */
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


        /*
         * Realign after orientation or
         * browser-size changes.
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

/* =========================================
   TESTIMONIAL MARQUEE
========================================= */

(() => {

    const marquee =
        document.querySelector(
            "[data-testimonial-marquee]"
        );


    if (!marquee) {
        return;
    }


    const track =
        marquee.querySelector(
            ".reviews-marquee-track"
        );


    const originalGroup =
        marquee.querySelector(
            "[data-marquee-original]"
        );


    if (!track || !originalGroup) {
        return;
    }


    /*
     * Reduced-motion preference.
     */

    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );


    /*
     * Remove generated copies.
     */

    const removeClones = () => {

        track
            .querySelectorAll(
                "[data-marquee-clone]"
            )
            .forEach(clone => {

                clone.remove();

            });

    };


    /*
     * Build enough repeated groups to cover
     * the viewport at all times.
     *
     * The animation always moves exactly the
     * width of ONE original group.
     */

    const buildMarquee = () => {

        marquee.classList.remove(
            "is-ready"
        );


        removeClones();


        /*
         * If reduced motion is requested,
         * leave only the original static row.
         */

        if (reducedMotion.matches) {

            marquee.style.removeProperty(
                "--reviews-marquee-offset"
            );

            return;
        }


        const groupWidth =
            Math.ceil(
                originalGroup
                    .getBoundingClientRect()
                    .width
            );


        const viewportWidth =
            Math.ceil(
                marquee
                    .getBoundingClientRect()
                    .width
            );


        if (
            groupWidth <= 0 ||
            viewportWidth <= 0
        ) {
            return;
        }


        /*
         * The reset point equals exactly
         * one complete testimonial sequence.
         */

        marquee.style.setProperty(
            "--reviews-marquee-offset",
            `-${groupWidth}px`
        );


        /*
         * At least two complete copies are
         * required. Add more on very wide
         * displays so blank space can never
         * enter the viewport.
         */

        const requiredWidth =
            viewportWidth +
            (groupWidth * 2);


        while (
            track.scrollWidth <
            requiredWidth
        ) {

            const clone =
                originalGroup.cloneNode(true);


            clone.setAttribute(
                "aria-hidden",
                "true"
            );


            clone.setAttribute(
                "data-marquee-clone",
                ""
            );


            track.appendChild(
                clone
            );

        }


        /*
         * Restart animation on the next frame.
         */

        requestAnimationFrame(() => {

            marquee.classList.add(
                "is-ready"
            );

        });

    };


    /*
     * Touch / pen:
     * holding the rail pauses it.
     */

    const pauseMarquee = event => {

        if (
            event.pointerType !== "touch" &&
            event.pointerType !== "pen"
        ) {
            return;
        }


        marquee.classList.add(
            "is-paused"
        );

    };


    const resumeMarquee = () => {

        marquee.classList.remove(
            "is-paused"
        );

    };


    marquee.addEventListener(
        "pointerdown",
        pauseMarquee,
        {
            passive: true
        }
    );


    window.addEventListener(
        "pointerup",
        resumeMarquee,
        {
            passive: true
        }
    );


    window.addEventListener(
        "pointercancel",
        resumeMarquee,
        {
            passive: true
        }
    );


    /*
     * Recalculate if the available marquee
     * width changes.
     */

    if (
        typeof ResizeObserver !==
        "undefined"
    ) {

        const resizeObserver =
            new ResizeObserver(() => {

                buildMarquee();

            });


        resizeObserver.observe(
            marquee
        );

    } else {

        window.addEventListener(
            "resize",
            buildMarquee
        );

    }


    /*
     * React immediately if the OS
     * motion preference changes.
     */

    const handleMotionChange = () => {

        buildMarquee();

    };


    if (
        typeof reducedMotion
            .addEventListener ===
        "function"
    ) {

        reducedMotion.addEventListener(
            "change",
            handleMotionChange
        );

    } else {

        reducedMotion.addListener(
            handleMotionChange
        );

    }


    /*
     * First build.
     */

    buildMarquee();

})();
