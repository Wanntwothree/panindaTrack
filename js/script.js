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

const themeBtn = document.getElementById("themeBtn");

function updateThemeIcon() {
  if (body.classList.contains("dark")) {
    themeBtn.textContent = "☀️";   // dark now, so show the sun
  } else {
    themeBtn.textContent = "🌙";   // light now, so show the moon
  }
}

themeBtn.addEventListener("click", () => {
  body.classList.toggle("dark");

  if (body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }

  updateThemeIcon();
});

updateThemeIcon();

//logs
function logStock(product, type, qty, after){//declaration
  const logs = JSON.parse(localStorage.getItem('stockLogs')) || [];//getting the logs
  logs.push({date: new Date().toISOString(), product, type, qty, after});//push the logs 
  localStorage.setItem('stockLogs', JSON.stringify(logs));//storing the logs
}