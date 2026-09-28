(function () {
  const root = document.documentElement;
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const themeBtn = document.querySelector(".theme-btn");
  const syncTheme = () => {
    const dark = root.getAttribute("data-theme") === "dark";
    themeBtn?.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#070b16" : "#f4f6fb");
  };
  syncTheme();
  themeBtn?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    if (next === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    try { localStorage.setItem("ps-theme", next); } catch (e) {}
    syncTheme();
  });

  const menuBtn = document.querySelector(".menu-btn");
  const nav = document.getElementById("site-nav");
  const closeMenu = () => {
    nav?.classList.remove("is-open");
    menuBtn?.setAttribute("aria-expanded", "false");
  };
  menuBtn?.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  const sections = [...document.querySelectorAll("main [id]")];
  const links = [...document.querySelectorAll("#site-nav a")];
  const mark = () => {
    let current = "home";
    sections.forEach((section) => {
      if (section.id && section.getBoundingClientRect().top < 140) current = section.id;
    });
    links.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${current}`));
  };
  window.addEventListener("scroll", mark, { passive: true });
  mark();

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16 });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
  }

  const viewAll = document.getElementById("view-all");
  viewAll?.addEventListener("click", () => {
    const extras = [...document.querySelectorAll("[data-group='more']")];
    const open = extras[0]?.hasAttribute("hidden");
    extras.forEach((card) => {
      if (open) {
        card.hidden = false;
        requestAnimationFrame(() => card.classList.add("is-in"));
      } else {
        card.hidden = true;
      }
    });
    viewAll.textContent = open ? "Show Featured Only" : "View All Projects";
  });

  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const ring = document.querySelector(".cursor");
  const dot = document.querySelector(".cursor-dot");
  if (fine && ring && dot && !reduce) {
    document.body.classList.add("has-cursor");
    window.addEventListener("pointermove", (event) => {
      ring.style.left = `${event.clientX}px`;
      ring.style.top = `${event.clientY}px`;
      dot.style.left = `${event.clientX}px`;
      dot.style.top = `${event.clientY}px`;
    }, { passive: true });
    document.querySelectorAll("a, button, summary").forEach((el) => {
      el.addEventListener("pointerenter", () => ring.classList.add("is-hot"));
      el.addEventListener("pointerleave", () => ring.classList.remove("is-hot"));
    });
  }

  document.querySelectorAll(".btn, .project, .note, .resume, .foot").forEach((el) => {
    el.addEventListener("touchstart", () => el.classList.add("is-pressed"), { passive: true });
    el.addEventListener("touchend", () => el.classList.remove("is-pressed"));
    el.addEventListener("touchcancel", () => el.classList.remove("is-pressed"));
  });

  const form = document.querySelector(".form");
  const note = document.querySelector(".form-note");
  const success = document.querySelector(".form-success");
  const fields = form?.querySelectorAll(".field input, .field textarea");

  const clearInvalid = (field) => field.classList.remove("is-invalid");
  fields?.forEach((input) => {
    input.addEventListener("input", () => clearInvalid(input.closest(".field")));
  });

  const showError = (message) => {
    form.classList.remove("is-sending");
    form.classList.add("is-error");
    if (note) {
      note.className = "form-note is-err";
      note.textContent = message;
    }
    window.setTimeout(() => form.classList.remove("is-error"), 450);
  };

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    let firstInvalid = null;
    fields?.forEach((input) => {
      const wrap = input.closest(".field");
      if (!input.checkValidity()) {
        wrap?.classList.add("is-invalid");
        if (!firstInvalid) firstInvalid = input;
      } else {
        wrap?.classList.remove("is-invalid");
      }
    });
    if (firstInvalid) {
      firstInvalid.focus();
      showError("Fill in the highlighted fields.");
      return;
    }

    const submit = form.querySelector('button[type="submit"]');
    form.classList.add("is-sending");
    form.classList.remove("is-error");
    if (submit) submit.disabled = true;
    if (note) {
      note.className = "form-note";
      note.textContent = "Sending…";
    }
    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error("fail");
      form.reset();
      form.classList.remove("is-sending");
      form.classList.add("is-sent");
      if (success) success.hidden = false;
      if (note) note.textContent = "";
    } catch (error) {
      showError("Couldn’t send just now. Email pratyanshs00@gmail.com instead.");
    } finally {
      if (submit) submit.disabled = false;
    }
  });

  document.getElementById("send-another")?.addEventListener("click", () => {
    form.classList.remove("is-sent");
    if (success) success.hidden = true;
    if (note) note.textContent = "";
    form.querySelector("input[name='name']")?.focus();
  });
})();
