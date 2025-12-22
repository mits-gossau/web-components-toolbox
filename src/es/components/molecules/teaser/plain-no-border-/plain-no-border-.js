// For Demo Purposes Only
document.body.setAttribute('style', '--background-color: #eee;')
if (document.querySelector(':root')) document.querySelector(':root').setAttribute('style', '--background-color: #eee;')

document.querySelectorAll('[text-position]').forEach(box => {
    const textposition = box.getAttribute('text-position');

    box.style.display = "inline-flex";
    box.style.verticalAlign = "top";

    box.style.flexDirection = (textposition === "top")
      ? "column-reverse" : "column";
  });