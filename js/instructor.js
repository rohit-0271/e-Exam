$(document).ready(function () {
    // Navbar
    $('#header').load('instructorHeader.html');
    // Show Name in Navbar
    fetch('/get-instructor-data-from-session').then(res=> res.json()).then(data => {
        document.getElementById('instructorName').innerText = data.name;
    })
});