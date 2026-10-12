// Builds the sidebar + topbar shell around each page's existing content.
// Reads config from data-* attributes on <body>:
//   data-page        "dashboard" | "calls" | "call" | "analytics"  (for active nav + no-nav-match on call detail pages)
//   data-title        text shown as the page title in the topbar
//   data-show-range   "true" to render an (initially empty) #range-label chip
(function () {
  const NAV = [
    { key: "dashboard", label: "Dashboard", href: "index.html", icon: "home" },
    { key: "calls", label: "Calls", href: "calls.html", icon: "phone" },
    { key: "followup", label: "Follow-up", href: "calls.html?view=followup", icon: "alert" },
    { key: "analytics", label: "Analytics", href: "analytics.html", icon: "barChart" },
  ];

  function init() {
    const lib = window.DashboardLib || { ICONS: {} };
    const ICONS = lib.ICONS;
    const body = document.body;
    const activePage = body.getAttribute("data-page") || "";
    const showRange = body.getAttribute("data-show-range") === "true";

    // The Follow-up nav item reuses the Calls page (pre-filtered via a query
    // param) rather than a separate HTML file, so it needs its own title/
    // active-state handling layered on top of the calls page's own data-*.
    const isFollowUpView = activePage === "calls" && new URLSearchParams(window.location.search).get("view") === "followup";
    const pageTitle = isFollowUpView ? "Follow-up" : (body.getAttribute("data-title") || "");

    const shell = document.querySelector(".app-shell");
    const bodyRow = document.querySelector(".body-row");
    if (!shell || !bodyRow) return;

    const topbarHtml = `
      <header class="topbar">
        <button type="button" class="icon-btn menu-btn" id="menu-btn" aria-label="Open navigation" aria-expanded="false">${ICONS.menu || ""}</button>
        <div class="brand">
          <div class="brand-mark" aria-hidden="true"><img src="assets/logo.png" alt="" /></div>
          <div class="brand-text">
            <div class="brand-name">Sunrise Hospital</div>
            <div class="page-title">${lib.escapeHtml ? lib.escapeHtml(pageTitle) : pageTitle}</div>
          </div>
        </div>
        <div class="spacer"></div>
        ${showRange ? `<span class="range-chip">${ICONS.calendar || ""}<span id="range-label"></span></span>` : ""}
      </header>
    `;
    shell.insertAdjacentHTML("afterbegin", topbarHtml);

    // Call Details isn't a top-level nav item, but it belongs to Calls —
    // keep "Calls" highlighted so wayfinding stays clear on that page.
    const isActive = (item) => {
      if (item.key === "followup") return isFollowUpView;
      if (item.key === "calls") return (activePage === "calls" && !isFollowUpView) || activePage === "call";
      return item.key === activePage;
    };

    const navLinksHtml = NAV.map(item => `
      <a class="nav-link${isActive(item) ? " active" : ""}" href="${item.href}">
        <span class="nav-icon">${ICONS[item.icon] || ""}</span>
        <span class="nav-label">${item.label}</span>
      </a>
    `).join("");

    const sidebarHtml = `
      <div class="sidebar-backdrop" id="sidebar-backdrop"></div>
      <aside class="sidebar" id="sidebar">
        <nav>${navLinksHtml}</nav>
      </aside>
    `;
    bodyRow.insertAdjacentHTML("afterbegin", sidebarHtml);

    // ---- Mobile drawer ----
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    const menuBtn = document.getElementById("menu-btn");

    function openDrawer() {
      sidebar.classList.add("mobile-open");
      backdrop.classList.add("visible");
      menuBtn.setAttribute("aria-expanded", "true");
    }
    function closeDrawer() {
      sidebar.classList.remove("mobile-open");
      backdrop.classList.remove("visible");
      menuBtn.setAttribute("aria-expanded", "false");
    }
    menuBtn.addEventListener("click", () => {
      sidebar.classList.contains("mobile-open") ? closeDrawer() : openDrawer();
    });
    backdrop.addEventListener("click", closeDrawer);
    sidebar.querySelectorAll(".nav-link").forEach(a => a.addEventListener("click", closeDrawer));
  }

  // Runs immediately (classic synchronous script): by the time this file
  // executes, the parser has already added the preceding .app-shell /
  // .body-row markup that every page places before this <script> tag —
  // and pages that set #range-label right after this script depend on the
  // sidebar/topbar (including #range-label itself) already existing.
  init();
})();
