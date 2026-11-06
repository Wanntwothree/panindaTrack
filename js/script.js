/*navbar active when select*/
document.querySelectorAll(".nav-bar li a").forEach(link => {
  if (link.href === window.location.href) {
    link.classList.add("active");
  }
});

/*theme*/
const body = document.body;

if (localStorage.getItem("theme") === "dark") {
  body.classList.add("dark");
}

const lightBtn = document.getElementById("light-btn");
const darkBtn = document.getElementById("dark-btn");

function updateButtons() {
  const isDark = body.classList.contains("dark");
  lightBtn.classList.toggle("active", !isDark);
  darkBtn.classList.toggle("active", isDark);
}

if (lightBtn && darkBtn) {
  updateButtons();

  lightBtn.addEventListener("click", () => {
    body.classList.remove("dark");
    localStorage.setItem("theme", "light");
    updateButtons();
  });

  darkBtn.addEventListener("click", () => {
    body.classList.add("dark");
    localStorage.setItem("theme", "dark");
    updateButtons();
  });
}
