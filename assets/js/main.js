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

document.querySelectorAll(".marqee").forEach((marqee) => {
    const track = marqee.querySelector(".marqee-track");
    const originalItems = Array.from(track.children);
    const singleSetWidth = track.scrollWidth;

    const createCloneSet = () => originalItems.map((item) => {
        const clone = item.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        return clone;
    });

    track.prepend(...createCloneSet());
    track.append(...createCloneSet());
    marqee.scrollLeft = singleSetWidth;

    let isDragging = false;
    let pointerId = null;
    let dragStartX = 0;
    let dragStartScrollLeft = 0;

    const normalizeScroll = () => {
        if (marqee.scrollLeft <= 0) {
            marqee.scrollLeft += singleSetWidth;
        } else if (marqee.scrollLeft >= singleSetWidth * 2) {
            marqee.scrollLeft -= singleSetWidth;
        }
    };

    marqee.addEventListener("pointerdown", (event) => {
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
});
