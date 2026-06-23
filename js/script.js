/**
 * NIKSAMART - Main Script
 * Vanilla JS replacement for jQuery dependency
 * Handles: Preloader, Swiper carousels, Product quantity, Parallax, Lightbox
 */

(function () {
  "use strict";

  // ========================================
  // PRELOADER
  // ========================================
  var initPreloader = function () {
    document.body.classList.add('preloader-site');

    window.addEventListener('load', function () {
      var preloader = document.querySelector('.preloader-wrapper');
      if (preloader) {
        preloader.style.transition = 'opacity 0.5s ease';
        preloader.style.opacity = '0';
        setTimeout(function () {
          preloader.style.display = 'none';
          document.body.classList.remove('preloader-site');
        }, 500);
      } else {
        document.body.classList.remove('preloader-site');
      }
    });
  };

  // ========================================
  // CHOCOLAT LIGHTBOX (vanilla - no jQuery needed)
  // ========================================
  var initChocolat = function () {
    if (typeof Chocolat !== 'undefined') {
      Chocolat(document.querySelectorAll('.image-link'), {
        imageSize: 'contain',
        loop: true,
      });
    }
  };

  // ========================================
  // SWIPER CAROUSELS
  // ========================================
  var initSwiper = function () {
    if (typeof Swiper === 'undefined') return;

    new Swiper(".main-swiper", {
      speed: 500,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
    });

    new Swiper(".category-carousel", {
      slidesPerView: 6,
      spaceBetween: 30,
      speed: 500,
      navigation: {
        nextEl: ".category-carousel-next",
        prevEl: ".category-carousel-prev",
      },
      breakpoints: {
        0: { slidesPerView: 2 },
        768: { slidesPerView: 3 },
        991: { slidesPerView: 4 },
        1500: { slidesPerView: 6 },
      }
    });

    new Swiper(".brand-carousel", {
      slidesPerView: 4,
      spaceBetween: 30,
      speed: 500,
      navigation: {
        nextEl: ".brand-carousel-next",
        prevEl: ".brand-carousel-prev",
      },
      breakpoints: {
        0: { slidesPerView: 2 },
        768: { slidesPerView: 2 },
        991: { slidesPerView: 3 },
        1500: { slidesPerView: 4 },
      }
    });

    new Swiper(".products-carousel", {
      slidesPerView: 5,
      spaceBetween: 30,
      speed: 500,
      navigation: {
        nextEl: ".products-carousel-next",
        prevEl: ".products-carousel-prev",
      },
      breakpoints: {
        0: { slidesPerView: 1 },
        768: { slidesPerView: 3 },
        991: { slidesPerView: 4 },
        1500: { slidesPerView: 6 },
      }
    });
  };

  // ========================================
  // PRODUCT QUANTITY SELECTOR
  // ========================================
  var initProductQty = function () {
    var productQtyElements = document.querySelectorAll('.product-qty');

    productQtyElements.forEach(function (el) {
      var plusBtn = el.querySelector('.quantity-right-plus');
      var minusBtn = el.querySelector('.quantity-left-minus');
      // Support both old #quantity and new qty-* IDs
      var qtyInput = el.querySelector('input[type="text"], input[type="number"]');

      if (plusBtn && qtyInput) {
        plusBtn.addEventListener('click', function (e) {
          e.preventDefault();
          var qty = parseInt(qtyInput.value) || 0;
          qtyInput.value = qty + 1;
        });
      }

      if (minusBtn && qtyInput) {
        minusBtn.addEventListener('click', function (e) {
          e.preventDefault();
          var qty = parseInt(qtyInput.value) || 0;
          if (qty > 0) {
            qtyInput.value = qty - 1;
          }
        });
      }
    });
  };

  // ========================================
  // JARALLAX PARALLAX (vanilla - no jQuery needed)
  // ========================================
  var initJarallax = function () {
    if (typeof jarallax !== 'undefined') {
      jarallax(document.querySelectorAll(".jarallax"));
      jarallax(document.querySelectorAll(".jarallax-keep-img"), {
        keepImg: true,
      });
    }
  };

  // ========================================
  // INITIALIZE ON DOM READY
  // ========================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initPreloader();
      initSwiper();
      initProductQty();
      initJarallax();
      initChocolat();
    });
  } else {
    initPreloader();
    initSwiper();
    initProductQty();
    initJarallax();
    initChocolat();
  }

})();