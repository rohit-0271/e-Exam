$(document).ready(function () {
    // Navbar
    $('#header').load('studentHeader.html');
    // Show Name in Navbar
    fetch('/get-student-data-from-session').then(res=> res.json()).then(data => {
        document.getElementById('studentName').innerText = data.firstName;
        document.getElementById('studentName').className ='text-capitalize';
    })
});