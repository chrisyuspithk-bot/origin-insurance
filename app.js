(function () {
  "use strict";

  var header = document.querySelector(".header");
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");

  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    header.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector("span").textContent = open ? "close" : "menu";
  }
  toggle.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });

  var links = Array.prototype.slice.call(nav.querySelectorAll("a:not(.btn)"));
  if ("IntersectionObserver" in window) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) { l.classList.toggle("is-active", l.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["about", "solutions", "partners", "enquiry"].forEach(function (id) {
      var el = document.getElementById(id); if (el) secObs.observe(el);
    });

    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        revObs.unobserve(en.target);
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function (el) {
      var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains("reveal"); });
      el.style.transitionDelay = Math.min(sibs.indexOf(el) * 80, 400) + "ms";
      revObs.observe(el);
    });
  } else {
    document.documentElement.classList.add("no-js");
  }

  var slides = document.querySelectorAll(".hero__slide");
  var cur = 0;
  if (slides.length > 1 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setInterval(function () {
      slides[cur].classList.remove("is-active");
      cur = (cur + 1) % slides.length;
      slides[cur].classList.add("is-active");
    }, 6000);
  }

  document.addEventListener("pointerdown", function (e) {
    var el = e.target.closest(".ripple");
    if (!el) return;
    var r = el.getBoundingClientRect();
    var size = Math.max(r.width, r.height);
    var w = document.createElement("span");
    w.className = "ripple__wave";
    w.style.width = w.style.height = size + "px";
    w.style.left = (e.clientX - r.left - size / 2) + "px";
    w.style.top = (e.clientY - r.top - size / 2) + "px";
    el.appendChild(w);
    setTimeout(function () { w.remove(); }, 650);
  });

  var topic = document.getElementById("f-topic");
  var form = document.getElementById("enquiryForm");
  if (!topic || !form) return;

  function syncSelect() { topic.classList.toggle("has-value", !!topic.value); }
  topic.addEventListener("change", syncSelect);
  document.querySelectorAll("[data-topic]").forEach(function (a) {
    a.addEventListener("click", function () {
      topic.value = a.getAttribute("data-topic");
      syncSelect();
    });
  });

  var params = new URLSearchParams(window.location.search);
  var topicParam = params.get("topic");
  if (topicParam) {
    for (var i = 0; i < topic.options.length; i++) {
      if (topic.options[i].text === topicParam) {
        topic.selectedIndex = i;
        syncSelect();
        break;
      }
    }
  }

  var toast = document.getElementById("toast");
  var toastMsg = document.getElementById("toastMsg");
  var toastTimer;
  function showToast(msg) {
    toastMsg.textContent = msg;
    toast.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-show"); }, 5000);
  }

  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var phoneRe = /^[+()\d\s-]{6,20}$/;

  function setErr(input, msg) {
    var field = input.closest(".field");
    if (!field) return;
    field.classList.toggle("is-invalid", !!msg);
    field.querySelector(".field__err").textContent = msg || "";
    input.setAttribute("aria-invalid", msg ? "true" : "false");
  }

  function validate(input) {
    var v = input.value.trim();
    var msg = "";
    switch (input.name) {
      case "name": if (v.length < 2) msg = "Please enter your name."; break;
      case "email": if (!emailRe.test(v)) msg = "Please enter a valid email address."; break;
      case "phone": if (v && !phoneRe.test(v)) msg = "Please enter a valid phone number or leave it blank."; break;
      case "topic": if (!v) msg = "Please choose a topic."; break;
      case "message": if (v.length < 10) msg = "Please tell us a little more (at least 10 characters)."; break;
    }
    setErr(input, msg);
    return !msg;
  }

  var inputs = form.querySelectorAll("input:not([type=checkbox]), select, textarea");
  inputs.forEach(function (i) {
    i.addEventListener("blur", function () { validate(i); });
    i.addEventListener("input", function () { if (i.closest(".field").classList.contains("is-invalid")) validate(i); });
  });

  var consent = document.getElementById("f-consent");
  var consentErr = document.getElementById("consentErr");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true, first = null;
    inputs.forEach(function (i) { if (!validate(i)) { ok = false; first = first || i; } });
    consentErr.textContent = consent.checked ? "" : "Please confirm we may contact you.";
    if (!consent.checked) { ok = false; first = first || consent; }
    if (!ok) { first.focus(); showToast("Please check the highlighted fields."); return; }

    form.reset();
    syncSelect();
    inputs.forEach(function (i) { setErr(i, ""); });
    showToast("Thank you — we will contact you.");
  });
})();
