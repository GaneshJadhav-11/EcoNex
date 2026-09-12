function collectorLogin() {

    localStorage.setItem("currentRole", "collector");

    window.location.href = "collector.html";
}


function recyclerLogin() {

    localStorage.setItem("currentRole", "recycler");

    window.location.href = "recycler.html";
}