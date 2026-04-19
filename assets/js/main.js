const root = document.documentElement;
const themeToggle = document.getElementById("theme-toggle");

const syncThemeToggle = () => {
    if (!themeToggle) {
        return;
    }

    themeToggle.setAttribute("aria-pressed", String(root.classList.contains("dark")));
};

syncThemeToggle();

themeToggle?.addEventListener("click", () => {
    const isDark = root.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    syncThemeToggle();
});

const desktopLoopQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

document.querySelectorAll(".marqee").forEach((marqee) => {
    const track = marqee.querySelector(".marqee-track");

    if (!track) {
        return;
    }

    const originalItems = Array.from(track.children);
    let leadingClones = [];
    let trailingClones = [];
    let isLooping = false;
    let isDragging = false;
    let pointerId = null;
    let dragStartX = 0;
    let dragStartScrollLeft = 0;

    const createCloneSet = () => originalItems.map((item) => {
        const clone = item.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.dataset.clone = "true";
        return clone;
    });

    const getSingleSetWidth = () => {
        const firstItem = originalItems[0];
        const lastItem = originalItems.at(-1);

        if (!firstItem || !lastItem) {
            return 0;
        }

        return (lastItem.offsetLeft + lastItem.offsetWidth) - firstItem.offsetLeft;
    };

    const normalizeScroll = () => {
        if (!isLooping) {
            return;
        }

        const singleSetWidth = getSingleSetWidth();

        if (!singleSetWidth) {
            return;
        }

        if (marqee.scrollLeft <= 1) {
            marqee.scrollLeft += singleSetWidth;
        } else if (marqee.scrollLeft >= (singleSetWidth * 2) - 1) {
            marqee.scrollLeft -= singleSetWidth;
        }
    };

    const enableLooping = () => {
        if (isLooping || !originalItems.length) {
            return;
        }

        leadingClones = createCloneSet();
        trailingClones = createCloneSet();

        track.prepend(...leadingClones);
        track.append(...trailingClones);

        isLooping = true;
        marqee.classList.add("is-looping");

        requestAnimationFrame(() => {
            marqee.scrollLeft = getSingleSetWidth();
        });
    };

    const disableLooping = () => {
        if (!isLooping) {
            return;
        }

        leadingClones.forEach((clone) => clone.remove());
        trailingClones.forEach((clone) => clone.remove());

        leadingClones = [];
        trailingClones = [];
        isLooping = false;

        marqee.classList.remove("is-looping");
        marqee.scrollLeft = 0;
    };

    const syncLoopMode = () => {
        if (desktopLoopQuery.matches) {
            enableLooping();
        } else {
            disableLooping();
        }
    };

    syncLoopMode();

    marqee.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "touch") {
            return;
        }

        isDragging = true;
        pointerId = event.pointerId;
        dragStartX = event.clientX;
        dragStartScrollLeft = marqee.scrollLeft;
        marqee.classList.add("is-dragging");
        marqee.setPointerCapture(pointerId);
    });

    marqee.addEventListener("pointermove", (event) => {
        if (!isDragging || event.pointerId !== pointerId) {
            return;
        }

        const deltaX = event.clientX - dragStartX;
        marqee.scrollLeft = dragStartScrollLeft - deltaX;
        normalizeScroll();
    });

    const stopDragging = (event) => {
        if (!isDragging || event.pointerId !== pointerId) {
            return;
        }

        isDragging = false;
        pointerId = null;
        marqee.classList.remove("is-dragging");

        if (marqee.hasPointerCapture(event.pointerId)) {
            marqee.releasePointerCapture(event.pointerId);
        }
    };

    marqee.addEventListener("scroll", normalizeScroll);
    marqee.addEventListener("pointerup", stopDragging);
    marqee.addEventListener("pointercancel", stopDragging);
    marqee.addEventListener("pointerleave", stopDragging);
    desktopLoopQuery.addEventListener("change", syncLoopMode);
    window.addEventListener("resize", () => {
        if (!isLooping) {
            return;
        }

        requestAnimationFrame(() => {
            marqee.scrollLeft = getSingleSetWidth();
        });
    });
});
