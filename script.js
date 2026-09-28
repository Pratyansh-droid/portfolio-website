(function () {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const themeBtn = document.querySelector(".theme-btn");
  const syncThemeLabel = () => {
    const dark = root.getAttribute("data-theme") === "dark";
    if (themeBtn) themeBtn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#09090d" : "#f4f2fb");
  };
  syncThemeLabel();
  themeBtn?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    if (next === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    try { localStorage.setItem("ps-theme", next); } catch (e) {}
    syncThemeLabel();
  });

  const menuBtn = document.querySelector(".menu-btn");
  const nav = document.getElementById("site-nav");
  const closeMenu = () => {
    nav?.classList.remove("is-open");
    menuBtn?.setAttribute("aria-expanded", "false");
  };
  menuBtn?.addEventListener("click", () => {
    const open = nav?.classList.toggle("is-open");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  const sections = [...document.querySelectorAll("main section")];
  const navLinks = [...document.querySelectorAll(".site-nav a")];
  const markActive = () => {
    let current = "";
    sections.forEach((section) => {
      if (!section.id) return;
      if (section.getBoundingClientRect().top < 180) current = section.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${current}`);
    });
  };
  window.addEventListener("scroll", markActive, { passive: true });
  markActive();

  const lines = [
    ["$ whoami", "Pratyansh Singh"],
    ["$ role", "Developer & QA"],
    ["$ company", "AAROHII AI"],
    ["$ location", "Kanpur Dehat, India"],
    ["$ focus", "Python, Django, QA"],
    ["$ shipping", "ViraQueue, Captverse"]
  ];
  const terminal = document.getElementById("terminal");

  const paintTerminal = () => {
    if (!terminal) return;
    terminal.innerHTML = lines
      .map(([cmd, out]) => `<div><span class="cmd">${cmd}</span><br><span class="out">${out}</span></div>`)
      .join("") + `<span class="caret" aria-hidden="true"></span>`;
  };

  const typeTerminal = () => {
    if (!terminal) return;
    if (reduce) {
      paintTerminal();
      return;
    }
    terminal.innerHTML = "";
    let i = 0;
    const step = () => {
      if (i >= lines.length) {
        terminal.insertAdjacentHTML("beforeend", `<span class="caret" aria-hidden="true"></span>`);
        return;
      }
      const [cmd, out] = lines[i];
      const block = document.createElement("div");
      const cmdEl = document.createElement("span");
      cmdEl.className = "cmd";
      const outEl = document.createElement("span");
      outEl.className = "out";
      block.append(cmdEl, document.createElement("br"), outEl);
      terminal.append(block);
      let c = 0;
      const typeCmd = () => {
        cmdEl.textContent = cmd.slice(0, c++);
        if (c <= cmd.length) {
          window.setTimeout(typeCmd, 18);
        } else {
          window.setTimeout(() => {
            outEl.textContent = out;
            i += 1;
            window.setTimeout(step, 160);
          }, 80);
        }
      };
      typeCmd();
    };
    step();
  };

  const finishLoader = () => {
    document.querySelector(".loader")?.classList.add("is-done");
  };

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      button.parentElement.querySelectorAll("button").forEach((peer) => {
        peer.classList.toggle("is-on", peer === button);
        peer.setAttribute("aria-selected", peer === button ? "true" : "false");
      });
      const value = button.getAttribute("data-filter");
      document.querySelectorAll("#skill-cloud li").forEach((item) => {
        const show = value === "all" || item.getAttribute("data-cat") === value;
        item.classList.toggle("is-out", !show);
      });
    });
  });

  document.querySelectorAll("[data-project-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      button.parentElement.querySelectorAll("button").forEach((peer) => {
        peer.classList.toggle("is-on", peer === button);
        peer.setAttribute("aria-selected", peer === button ? "true" : "false");
      });
      const value = button.getAttribute("data-project-filter");
      document.querySelectorAll("#project-grid .card").forEach((card) => {
        const show = value === "all" || card.getAttribute("data-kind") === value;
        card.classList.toggle("is-hidden", !show);
      });
    });
  });

  const form = document.querySelector(".form");
  const note = document.querySelector(".form-note");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = form.querySelector('button[type="submit"]');
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
      if (!response.ok) throw new Error("Request failed");
      form.reset();
      if (note) {
        note.className = "form-note is-ok";
        note.textContent = "Message sent. I’ll get back to you.";
      }
    } catch (error) {
      if (note) {
        note.className = "form-note is-err";
        note.textContent = "Couldn’t send just now. Email pratyanshs00@gmail.com instead.";
      }
    } finally {
      if (submit) submit.disabled = false;
    }
  });

  const startMotion = () => {
    finishLoader();
    typeTerminal();
    if (reduce || typeof window.gsap === "undefined") return;
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    gsap.from(".line-inner", {
      yPercent: 110,
      duration: 0.9,
      ease: "power4.out",
      stagger: 0.08,
      delay: 0.15
    });
    gsap.from(".hero-copy > *:not(h1)", {
      y: 18,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.06,
      delay: 0.35
    });
    gsap.from(".terminal", {
      y: 28,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      delay: 0.3
    });

    gsap.to(".progress", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 }
    });

    gsap.utils.toArray(".reveal").forEach((el) => {
      gsap.from(el, {
        y: 36,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });
  };

  const loaderBar = document.querySelector(".loader-bar");
  if (reduce) {
    finishLoader();
    paintTerminal();
  } else if (typeof window.gsap !== "undefined" && loaderBar) {
    window.gsap.to(loaderBar, {
      scaleX: 1,
      duration: 0.9,
      ease: "power2.inOut",
      onComplete: startMotion
    });
  } else {
    window.setTimeout(() => {
      finishLoader();
      typeTerminal();
    }, 700);
  }

  window.setTimeout(finishLoader, 2600);
})();
