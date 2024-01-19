$(document).ready(function () {
    // Navbar
    $('#header').load('adminHeader.html');
    // Show Name in Navbar
    fetch('/get-admin-data-from-session').then(res=> res.json()).then(data => {
        document.getElementById('adminUserName').innerText = data.fullname;
    })
});