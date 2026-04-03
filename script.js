const scrollTopButton = document.getElementById("scrollTopButton");
const stickyHeader = document.getElementById("stickyHeader");
const heroSection = document.getElementById("heroSection");
const heroTrack = document.getElementById("heroTrack");
const heroSlider = document.getElementById("heroSlider");
const heroDots = Array.from(document.querySelectorAll(".hero-dot"));
const productsSlider = document.getElementById("productsSlider");
const productsScroll = document.getElementById("productsScroll");
const productsSwipeBadge = document.getElementById("productsSwipeBadge");
const productsProgress = document.getElementById("productsProgress");
const ingredientCards = Array.from(document.querySelectorAll("[data-ingredient-card]"));
const magazineSection = document.querySelector(".magazine");
const magazineStage = document.getElementById("magazineStage");
const magazineStack = document.getElementById("magazineStack");
const magazineCards = Array.from(document.querySelectorAll("[data-magazine-card]"));
const magazineOutro = document.querySelector(".magazine-outro");

if (scrollTopButton) {
  scrollTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

if (stickyHeader && heroSection) {
  const updateStickyHeader = () => {
    const triggerPoint = heroSection.offsetHeight - 56;
    const isVisible = window.scrollY > triggerPoint;

    stickyHeader.classList.toggle("visible", isVisible);
    stickyHeader.setAttribute("aria-hidden", String(!isVisible));
  };

  updateStickyHeader();
  window.addEventListener("scroll", updateStickyHeader, { passive: true });
  window.addEventListener("resize", updateStickyHeader);
}

if (heroTrack && heroSlider && heroDots.length) {
  const heroSlides = Array.from(heroTrack.querySelectorAll(".hero-slide"));
  let currentSlide = 0;
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  const clampSlide = (index) => Math.max(0, Math.min(index, heroSlides.length - 1));

  const renderSlide = (index, withTransition = true) => {
    currentSlide = clampSlide(index);
    heroTrack.style.transition = withTransition ? "transform 280ms ease" : "none";
    heroTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

    heroSlides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === currentSlide);
    });

    heroDots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === currentSlide);
      dot.setAttribute("aria-current", dotIndex === currentSlide ? "true" : "false");
    });
  };

  const onPointerDown = (event) => {
    isDragging = true;
    startX = event.clientX;
    currentX = event.clientX;
    heroTrack.style.transition = "none";
  };

  const onPointerMove = (event) => {
    if (!isDragging) return;
    currentX = event.clientX;
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    const deltaX = currentX - startX;
    isDragging = false;

    if (Math.abs(deltaX) > 48) {
      renderSlide(currentSlide + (deltaX < 0 ? 1 : -1));
      return;
    }

    renderSlide(currentSlide);
  };

  heroDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      renderSlide(index);
    });
  });

  heroSlider.addEventListener("pointerdown", onPointerDown);
  heroSlider.addEventListener("pointermove", onPointerMove);
  heroSlider.addEventListener("pointerup", onPointerUp);
  heroSlider.addEventListener("pointerleave", onPointerUp);
  heroSlider.addEventListener("pointercancel", onPointerUp);

  renderSlide(0);
}

if (productsScroll && productsSlider) {
  const productCards = Array.from(productsScroll.querySelectorAll(".product-card"));
  let startX = 0;
  let dragOffset = 0;
  let isPointerDown = false;
  let currentProductIndex = 0;

  const getProductStep = () => {
    if (productCards.length < 2) return productCards[0]?.offsetWidth || 280;
    return productCards[1].offsetLeft - productCards[0].offsetLeft;
  };

  const getProductsTranslateX = (index) => {
    const step = getProductStep();
    return -(step * index);
  };

  const renderProductsTrack = (translateX) => {
    const maxNegative = Math.min(0, productsSlider.clientWidth - productsScroll.scrollWidth);
    const clampedTranslateX = Math.max(maxNegative, Math.min(0, translateX));
    productsScroll.style.transform = `translateX(${clampedTranslateX}px)`;
  };

  const updateProductsProgress = (index) => {
    if (!productsProgress || productCards.length <= 1) return;
    const trackWidth = productsProgress.offsetWidth;
    const thumbWidth = trackWidth / productCards.length;
    const available = Math.max(trackWidth - thumbWidth, 0);
    const ratio = productCards.length > 1 ? index / (productCards.length - 1) : 0;

    productsProgress.style.setProperty("--products-progress-width", `${thumbWidth}px`);
    productsProgress.style.setProperty("--products-progress-offset", `${available * ratio}px`);
  };

  const renderProductsIndex = (index, behavior = "smooth") => {
    const clampedIndex = Math.max(0, Math.min(index, productCards.length - 1));
    currentProductIndex = clampedIndex;
    productsScroll.style.transition = behavior === "auto" ? "none" : "transform 280ms ease";
    renderProductsTrack(getProductsTranslateX(clampedIndex));

    productCards.forEach((card, cardIndex) => {
      card.classList.toggle("is-active", cardIndex === clampedIndex);
    });

    updateProductsProgress(clampedIndex);
  };

  const onProductsPointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    isPointerDown = true;
    startX = event.clientX;
    dragOffset = getProductsTranslateX(currentProductIndex);
    productsScroll.classList.add("is-dragging");
    productsScroll.setPointerCapture(event.pointerId);
  };

  const onProductsPointerMove = (event) => {
    if (!isPointerDown) return;
    event.preventDefault();
    const deltaX = event.clientX - startX;
    renderProductsTrack(dragOffset + deltaX);
  };

  const onProductsPointerUp = (event) => {
    if (!isPointerDown) return;
    const deltaX = event.clientX - startX;
    isPointerDown = false;
    productsScroll.classList.remove("is-dragging");
    if (event && productsScroll.hasPointerCapture(event.pointerId)) {
      productsScroll.releasePointerCapture(event.pointerId);
    }

    if (Math.abs(deltaX) > 48) {
      renderProductsIndex(currentProductIndex + (deltaX < 0 ? 1 : -1));
      return;
    }

    renderProductsIndex(currentProductIndex);
  };

  productsScroll.addEventListener("pointerdown", onProductsPointerDown);
  productsScroll.addEventListener("pointermove", onProductsPointerMove);
  productsScroll.addEventListener("pointerup", onProductsPointerUp);
  productsScroll.addEventListener("pointerleave", onProductsPointerUp);
  productsScroll.addEventListener("pointercancel", onProductsPointerUp);
  window.addEventListener("resize", () => {
    renderProductsIndex(currentProductIndex, "auto");
  });

  renderProductsIndex(0, "auto");
}

if (productsSwipeBadge) {
  window.setTimeout(() => {
    productsSwipeBadge.classList.add("is-hidden");
  }, 3000);
}

if (ingredientCards.length) {
  ingredientCards.forEach((card) => {
    const openButton = card.querySelector("[data-ingredient-open]");
    const closeButton = card.querySelector("[data-ingredient-close]");
    const detailPanel = card.querySelector(".ingredient-detail-panel");

    if (openButton && detailPanel) {
      openButton.addEventListener("click", () => {
        ingredientCards.forEach((otherCard) => {
          if (otherCard !== card) {
            otherCard.classList.remove("is-expanded");
            const otherDetail = otherCard.querySelector(".ingredient-detail-panel");
            if (otherDetail) {
              otherDetail.setAttribute("aria-hidden", "true");
            }
          }
        });

        card.classList.add("is-expanded");
        detailPanel.setAttribute("aria-hidden", "false");
      });
    }

    if (closeButton && detailPanel) {
      closeButton.addEventListener("click", () => {
        card.classList.remove("is-expanded");
        detailPanel.setAttribute("aria-hidden", "true");
      });
    }
  });
}

if (magazineSection && magazineStage && magazineStack && magazineCards.length) {
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let magazineRaf = 0;
  let naturalOffsets = [];
  let collapsedOffsets = [];
  let magazineScrollDistance = 0;

  const updateMagazineCards = () => {
    magazineRaf = 0;

    if (reducedMotionQuery.matches) {
      magazineCards.forEach((card) => {
        card.style.transform = "none";
      });
      if (magazineOutro) {
        magazineOutro.style.transform = "none";
      }
      return;
    }

    const sectionRect = magazineSection.getBoundingClientRect();
    const stickyTop = 24;
    const progress = Math.max(0, Math.min(-sectionRect.top + stickyTop, magazineScrollDistance));

    magazineCards.forEach((card, index) => {
      const translateY = Math.max(collapsedOffsets[index], naturalOffsets[index] - progress);
      card.style.transform = `translateY(${translateY}px)`;
    });

    if (magazineOutro) {
      magazineOutro.style.transform = `translateY(${-progress}px)`;
    }
  };

  const requestMagazineUpdate = () => {
    if (magazineRaf) return;
    magazineRaf = window.requestAnimationFrame(updateMagazineCards);
  };

  const setupMagazineStack = () => {
    if (reducedMotionQuery.matches) {
      magazineSection.style.removeProperty("--magazine-section-height");
      magazineStage.style.removeProperty("--magazine-scroll-distance");
      magazineStack.style.removeProperty("--magazine-stack-height");
      magazineCards.forEach((card) => {
        card.style.transform = "none";
      });
      if (magazineOutro) {
        magazineOutro.style.transform = "none";
      }
      return;
    }

    const cardGap = 24;
    const collapsedStep = 18;
    const stickyTop = 24;
    const outroGap = 40;
    const outroBottomSpace = 80;
    const headerHeight = magazineStage.querySelector(".magazine-header")?.offsetHeight || 0;
    const cardHeights = magazineCards.map((card) => card.offsetHeight);
    naturalOffsets = [];
    collapsedOffsets = [];

    cardHeights.forEach((height, index) => {
      naturalOffsets[index] = index === 0 ? 0 : naturalOffsets[index - 1] + cardHeights[index - 1] + cardGap;
      collapsedOffsets[index] = index * collapsedStep;
    });

    const stackHeight = Math.max(...cardHeights.map((height, index) => collapsedOffsets[index] + height));
    magazineScrollDistance = Math.max(
      naturalOffsets[naturalOffsets.length - 1] - collapsedOffsets[collapsedOffsets.length - 1],
      0
    );
    const outroHeight = magazineOutro?.offsetHeight || 0;
    const sectionHeight =
      64 + headerHeight + stackHeight + magazineScrollDistance + outroGap + outroHeight + outroBottomSpace + stickyTop;

    magazineStage.style.setProperty("--magazine-header-height", `${headerHeight}px`);
    magazineStage.style.setProperty("--magazine-scroll-distance", `${magazineScrollDistance}px`);
    magazineStack.style.setProperty("--magazine-stack-height", `${stackHeight}px`);
    magazineSection.style.setProperty("--magazine-section-height", `${sectionHeight}px`);

    requestMagazineUpdate();
  };

  setupMagazineStack();
  window.addEventListener("scroll", requestMagazineUpdate, { passive: true });
  window.addEventListener("resize", setupMagazineStack);
  reducedMotionQuery.addEventListener("change", setupMagazineStack);
}
