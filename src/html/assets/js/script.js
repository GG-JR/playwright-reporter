function showHideScroll(action) {
  let element = document.getElementById("body-content");

  if (action === "show") {
    if (element.classList.contains("hide-scroll")) {
      element.classList.remove("hide-scroll");    
    }
  } else if (action === "hide") {
    if (!element.classList.contains("hide-scroll")) {
      element.classList.add("hide-scroll");    
    }
  }
}

/** LOADER **/
function hideLoader() {
  document.getElementById("loading").style.visibility = "visibility";
  document.getElementById("loading").style.opacity = "0";
  document.getElementById("loading").style.transition = "all .3s linear";
  document.getElementById("loading").style.zIndex = "0";
  setTimeout(function () {
    document.getElementById("loading").style.display = "none";
  }, 1800);
}
if (window.addEventListener) {
  window.addEventListener("load", hideLoader);
} else if (window.attachEvent) {
  window.attachEvent("onload", hideLoader);
} else {
  window.onload = hideLoader;
}



function openResultTab(evt, tabName, modalId) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("result-tabcontent-" + modalId);
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("result-tablinks-" + modalId);
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

function openMainTab(evt, tabName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("main-tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("main-tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}