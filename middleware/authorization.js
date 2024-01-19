function isAdminLoggedIn(req, res, next) {
    if (req.session.admin_data) {
        next();
    } else {
        res.redirect("/admin-login")
    }
}

function isInstructorLoggedIn(req, res, next) {
    if (req.session.instructor_data) {
        next();
    } else {
        res.redirect("/instructor-login")
    }
}

function isStudentLoggedIn(req, res, next) {
    if (req.session.student_data) {
        next();
    } else {
        res.redirect("/student-login")
    }
}

module.exports = {
    isAdminLoggedIn, isInstructorLoggedIn, isStudentLoggedIn
}