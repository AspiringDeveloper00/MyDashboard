$(document).on("scroll", function () {

    if ($(document).scrollTop() > 80) {
        $("#primary-nav").addClass("shrink");
        if ($("#navbarCollapse").hasClass('show')) {
            $("#span-1").addClass("span-1-class");
            $("#span-3").addClass("span-3-class");
        }
    } else {
        if (!($("#navbarCollapse").hasClass('show') || $("#navbarCollapse").hasClass('collapsing'))) {
            $("#primary-nav").removeClass("shrink");

            $("#span-1").removeClass("span-1-class");
            $("#span-3").removeClass("span-3-class");
        }
    }

});

$(document).ready(function () {
    if ($(document).scrollTop() > 80) {
        $("#primary-nav").addClass("shrink");
        if ($("#navbarCollapse").hasClass('show')) {
            $("#span-1").addClass("span-1-class");
            $("#span-3").addClass("span-3-class");
        }}
})

$(".navbar-toggler").click(function () {
    if ($("#primary-nav").hasClass("shrink") && ($("#navbarCollapse").hasClass('show') || $("#navbarCollapse").hasClass('collapsing'))) {
        $("#span-1").removeClass("span-1-class");
        $("#span-3").removeClass("span-3-class");
    } else if (($("#primary-nav").hasClass("shrink") && !($("#navbarCollapse").hasClass('show') || $("#navbarCollapse").hasClass('collapsing')))) {
        $("#span-1").addClass("span-1-class");
        $("#span-3").addClass("span-3-class");
    }

    if (!$("#primary-nav").hasClass("shrink") && !($("#navbarCollapse").hasClass('show') || $("#navbarCollapse").hasClass('collapsing'))) {
        $("#primary-nav").css("background-color", "#14151A");
    } else if (!$("#primary-nav").hasClass("shrink") && ($("#navbarCollapse").hasClass('show') || $("#navbarCollapse").hasClass('collapsing'))) {
        $("#primary-nav").css("background-color", "transparent");

    } else if (($(document).scrollTop() <= 80) && $("#primary-nav").hasClass("shrink") && ($("#navbarCollapse").hasClass('show') || $("#navbarCollapse").hasClass('collapsing'))) {
        $("#primary-nav").removeClass("shrink");
    }
});

$(function () {
    $("#logo").click(function () {
        animateCSS('#logo', 'rubberBand');
        return false;
    });
});


// document.onkeydown = function (e) {
//     if (event.keyCode == 123) {
//         return false;
//     }
//     if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
//         return false;
//     }
//     if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) {
//         return false;
//     }
//     if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
//         return false;
//     }
//     if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
//         return false;
//     }
// }