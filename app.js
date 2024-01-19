let express = require("express");
let app = express();
let path = require("path");
let fileUpload = require('express-fileupload');
let session = require('express-session');
let nodeMailer = require('nodemailer')

let {
    isAdminLoggedIn,
    isInstructorLoggedIn,
    isStudentLoggedIn
} = require('./middleware/authorization')

/* ADMIN */
let {
    adminLogout,
    adminDashboard,
    manageAdmin,
    manageSubject,
    manageInstructor,
    manageCourse,
    manageStudents,
    addNewStudent,
    fetchStudents,
    disableStudents,
    addNewSubjectOfStudent,
    fetchCoursesOfThisStudent,
    deleteSubjectOfStudent,
    getTotalCounts,
    renderChangePasswordView,
    updatePassword,
    renderAdminForgotPasswordView,
    verifyAdminUsername,
    adminViewResults,
    adminExamResults,
    fetchSubjectMarks
} = require('./controller/adminController')

/* STUDENT */
let {
    studentLogout,
    renderLoginPage,
    studentLoginHandler,
    renderStudentDashboard,
    renderStudentProfile,
    getProfileData,
    getCourseOfThisStudent,
    fetchUpcomingExams,
    renderStudentExams,
    getExamQuestions,
    saveMyResult,
    renderStudentResult,
    getStudentResult,
    renderStudentChangePasswordView,
    updateStudentPassword,
    renderStudentForgotPasswordView,
    verifyStudentEmail
} = require('./controller/studentController')
/* STUDENT  (end) */

/* INSTRUCTOR */
let {
    Logout,
    instructorDashboard,
    manageExams,
    manageQuestions,
    courseAndSubjectsOfInstructor,
    addNewQuestion,
    fetchQuestions,
    deleteQuestion,
    addNewExam,
    viewExams,
    viewExamsData,
    assignSubjectToExam,
    deleteExam,
    assignSubjectQuestionsToExam,
    renderInstructorChangePasswordView,
    updateInstructorPassword,
    renderInstructorForgotPasswordView,
    verifyInstructorEmail,
    instructorViewResults
} = require('./controller/instructorController')
/* INSTRUCTOR (end) */

let port = 5000

/* database connection */
let connection = require('./config/db')
/* database connection (end) */

app.use(fileUpload({}));
app.use(express.json()); // json receive (frontend)
app.use(express.urlencoded({extended: false})); // post method...
app.use(express.static('css')); // style file
app.use(express.static('js'));
app.use(express.static('bootstrap')); // static files...
app.use(express.static('images')); // static files...
app.use(express.static('controller'));
app.use(express.static('html-files'));

/* session */
app.use(session(
    {
        secret: "123@abc",
        resave: false,
        saveUninitialized: false
    }
));
/* session (end) */

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

/* password */
function generateRandomPassword(length) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
}

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

/* email */
async function sendEmailToUser(toEmail, emailSubject, htmlMessage) {
    let username = 'vmm.testing.email@gmail.com';
    let password = 'nqxdyzymymmvnkxe';

    let transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
            user: username,
            pass: password
        }
    });

    let mailOptions = {
        from: username,
        to: toEmail,
        subject: emailSubject,
        html: htmlMessage
    };

    try {
        return await transporter.sendMail(mailOptions);
    } catch (e) {
        return e;
    }
}

const fetchInstructorSubjects = (rows) => {
    return new Promise((resolve, reject) => {
        let counter = 0;
        for (let i = 0; i < rows.length; i++) {
            let {subjects} = rows[i];
            let getSubjects = `SELECT sName FROM subject WHERE sID IN (${subjects}) ORDER BY sName ASC`;
            connection.query(getSubjects, (e, subjectRow) => {
                rows[i]['subject_name'] = subjectRow;
                counter++;
                if (counter === rows.length) {
                    resolve(rows)
                }
            });
        }
    })
}

/* ------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------ */

function fetchSubjects(rows) {
    return new Promise((resolve, reject) => {
        let counter = 0;
        let rowLength = rows.length;
        for (let i = 0; i < rowLength; i++) {
            let {courseID} = rows[i];
            let getSubjects = `SELECT * FROM subject WHERE courseID=${courseID}`;
            connection.query(getSubjects, (e, subjectRows) => {
                rows[i]['subjects'] = subjectRows;
                counter++;
                if (counter === rowLength) {
                    resolve(rows);
                }
            });
        }
    })
}

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

/* email (end) */

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

/* email testing */
app.get('/email', async (req, res) => {
    let insName = 'Subhrato Singh';
    let insUsername = 'subhrato96';
    let insPassword = '123';
    let toEmail = 'subhratosingh@gmail.com';
    let emailSubject = 'New Instructor Added to Online Examination System - Login Details Included';
    let htmlMessage = `<h4>Dear ${insName}</h4>`;
    htmlMessage += `<p>I trust this message finds you well. We are thrilled to announce the addition of a new instructor to Online Examination System Website</p><br>`
    htmlMessage += `<b>Your Login Details:</b>`
    htmlMessage += `<table style="border: 1px solid #000; border-collapse: collapse; padding: 5px">`;
    htmlMessage += `<tr><td style="border: 1px solid #000; border-collapse: collapse; padding: 5px">Email</td> <td style="border: 1px solid #000; border-collapse: collapse; padding: 5px">${toEmail}</td></tr>`;
    htmlMessage += `<tr><td style="border: 1px solid #000; border-collapse: collapse; padding: 5px">Password</td> <td style="border: 1px solid #000; border-collapse: collapse; padding: 5px">${insPassword}</td></tr>`;
    htmlMessage += `</table><br>`;
    htmlMessage += `<b>Please follow these steps to get started:</b><br>`;
    htmlMessage += `<span>1. Visit our website: http://localhost:3000/instructor-login</span><br>`;
    htmlMessage += `<span>2. Enter your provided email and temporary password.</span> <br>`;
    htmlMessage += `<span>3. Click on the "Login" button.</span><br>`;
    htmlMessage += `<p>Once you've successfully logged in, you can explore the instructor's profile, view their courses, and engage with the learning materials they've prepared.</p>`;
    htmlMessage += `<b>Warm regards,</b><br>`;
    htmlMessage += `<span>Admin Name</span><br>`;
    htmlMessage += `<span>Admin</span>`;

    let data = await sendEmailToUser(toEmail, emailSubject, htmlMessage);
    res.send({response: data});
    // res.send({response: data.responseCode})
    // res.send({response: data.response})
})
/* email testing (end) */

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

/* STUDENT ROUTES */

app.post('/student-result', getStudentResult)
app.post('/save-result', saveMyResult)
app.get('/get-student-data-from-session', (req, res) => {
    res.json(req.session.student_data)
})
app.get('/student-course-subjects', getCourseOfThisStudent)
app.post("/student-profile", getProfileData)
app.get('/upcoming-exams', fetchUpcomingExams)
app.get('/get-exam-questions/:examSubjectID', getExamQuestions)
app.post("/student-change-password", isStudentLoggedIn, updateStudentPassword);
app.post("/verify-student-email", verifyStudentEmail);

// Logout
app.get("/student-logout", isStudentLoggedIn, studentLogout);

// Render Pages
app.get("/student-forgot-password", renderStudentForgotPasswordView);
app.get("/student-change-password", isStudentLoggedIn, renderStudentChangePasswordView);
app.get('/student-result', isStudentLoggedIn, renderStudentResult)
app.get('/student-exams', isStudentLoggedIn, renderStudentExams)
app.get("/student-profile", isStudentLoggedIn, renderStudentProfile)
app.get("/student-dashboard", isStudentLoggedIn, renderStudentDashboard)
app.post('/student-login', studentLoginHandler)
app.get("/student-login", renderLoginPage)

/* STUDENT ROUTES (end) */

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

/* INSTRUCTOR ROUTES */

app.get('/get-instructor-data-from-session', (req, res) => {
    res.json(req.session.instructor_data)
})
app.get('/get-instructors-course-and-subjects', courseAndSubjectsOfInstructor)
app.get('/question-view/:subjectID', fetchQuestions)
app.delete('/question/:id', deleteQuestion)
app.post('/question', addNewQuestion)
app.get('/exams-data-view', viewExamsData)
app.delete('/exams/:examID', deleteExam)
app.post('/exams', addNewExam)
app.get('/assign-subject-to-exam/:subjectID/:numberOfQuestion/:examID', assignSubjectToExam)
app.post('/assign-subject-questions-to-exam', assignSubjectQuestionsToExam)
app.post("/instructor-update-password", updateInstructorPassword);
app.post("/verify-instructor-email", verifyInstructorEmail);

// Logout
app.get("/instructor-logout", isInstructorLoggedIn, Logout);

// Render Pages
app.get("/instructor-results", instructorViewResults);
app.get("/instructor-forgot-password", renderInstructorForgotPasswordView);
app.get("/instructor-update-password", isInstructorLoggedIn, renderInstructorChangePasswordView);
app.get("/questions", isInstructorLoggedIn, manageQuestions);
app.get('/exams-view', isInstructorLoggedIn, viewExams)
app.get("/exams", isInstructorLoggedIn, manageExams);
app.get("/instructor-dashboard", isInstructorLoggedIn, instructorDashboard);

/* INSTRUCTOR ROUTES (end) */

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

/* ADMIN ROUTES */

app.get('/get-total-counts', getTotalCounts)
app.get('/get-admin-data-from-session', (req, res) => {
    res.json(req.session.admin_data)
})
app.post('/add-admins', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let fullname = req.body.fullname;
    let email = req.body.email;
    let usertype = req.body.usertype;
    let checkusername = "select * from admin_table where username='" + username + "'";
    connection.query(checkusername, (error, row) => {
        if (error) {
            res.send(error.message);
        } else {
            if (row.length > 0) {
                res.send("username already exists");
            } else {
                let insertAdmin = "INSERT INTO admin_table VALUES ('" + username + "', '" + password + "', '" + fullname + "','" + email + "','" + usertype + "', 'active')";
                connection.query(insertAdmin, (error) => {
                    if (error) {
                        res.send(error.message);
                    } else {
                        res.send("New admin added successfully.");
                    }
                })
            }
        }
    })
})
app.get("/delete-admin/:username/:status", (req, res) => {
    let {username, status} = req.params
    let deleteAdmin = `UPDATE admin_table SET statusl='${status}' WHERE username='${username}'`;
    connection.query(deleteAdmin, (error) => {
        if (error) {
            res.send(error.message);
        } else {
            res.send("Admin Status Updated");
        }
    })
})
app.get('/view-admins', (req, res) => {
    let {username, usertype} = req.session.admin_data;
    let viewAdmins = `select * from admin_table where username<>'${username}'`;
    connection.query(viewAdmins, (error, rows) => {
        if (error) {
            res.send(error.message)
        } else {
            res.json({rows, usertype})
        }
    })
})
app.get('/course-view', (req, res) => {
    let viewCat = "select * from course order by courseName asc";
    connection.query(viewCat, (error, rows) => {
        if (error) {
            res.send(error.message)
        } else {
            res.send(rows)
        }
    })
})
app.delete('/course/:id', (req, res) => {
    console.log(req.params)
    let id = req.params.id;
    let deleteCat = "DELETE FROM course WHERE courseID=" + id + "";
    connection.query(deleteCat, (error) => {
        if (error) {
            return res.send(error.message)
        }
        res.send("Category deleted successfully.")
    })
})
app.post('/course', (req, res) => {
    let {name, description} = req.body;
    let checkCourse = "Select * from course where courseName ='" + name + "' ";
    connection.query(checkCourse, (e, row) => {
        if (e) {
            res.send(e.message);
        } else {
            if (row.length > 0) {
                res.send("Course already exists.");
            } else {
                let {logo} = req.files;
                let serverPath = "images/courseLogo/" + logo.name;
                let dbPath = "courseLogo/" + logo.name;
                logo.mv(serverPath, (error) => {
                    if (error) {
                        return res.send(error.message);
                    }
                    let insertCategory = "INSERT INTO course VALUES(null,'" + name + "', '" + dbPath + "', '" + description + "')";
                    connection.query(insertCategory, (error) => {
                        if (error) {
                            res.send(error.message);
                        } else {
                            res.send("Course added successfully...");
                        }
                    })
                })
            }
        }
    })
})
app.get('/subject-view', (req, res) => {
    let fetchCourseID = "SELECT * FROM course";
    connection.query(fetchCourseID, async (error, rows) => {
        if (error) {
            return res.send(error.message)
        }
        await fetchSubjects(rows);
        res.send(rows)
    })
})
app.delete('/subject/:id', (req, res) => {
    let id = req.params.id;
    let deleteCat = "DELETE FROM subject WHERE sID=" + id + "";
    connection.query(deleteCat, (error) => {
        if (error) {
            return res.send(error.message)
        }
        res.send("Subject deleted successfully.")
    })
})
app.post('/subject', (req, res) => {
    let {courseName, sName, sCode, sDescription} = req.body;
    let checkSubject = "Select * from subject where sCode ='" + sCode + "' ";
    connection.query(checkSubject, (e, row) => {
        if (e) {
            res.send(e.message);
        } else {
            if (row.length > 0) {
                res.send("Subject already exists.");
            } else {
                let {logo} = req.files;
                let serverPath = "images/subjectLogo/" + logo.name;
                let dbPath = "subjectLogo/" + logo.name;
                logo.mv(serverPath, (error) => {
                    if (error) {
                        return res.send(error.message);
                    }
                    let insertCategory = "INSERT INTO subject VALUES(null,'" + sCode + "', '" + sName + "', '" + dbPath + "', '" + sDescription + "', " + courseName + ")";
                    connection.query(insertCategory, (error) => {
                        if (error) {
                            res.send(error.message);
                        } else {
                            res.send("Success");
                        }
                    })
                })
            }
        }
    })
})
app.get('/subjects-of-course/:courseID', (req, res) => {
    let {courseID} = req.params;
    let fetchSubjects = `SELECT * FROM subject WHERE courseID=${courseID}`;
    connection.query(fetchSubjects, (e, rows) => {
        res.send(rows)
    })
})
app.get('/instructors-view', (req, res) => {
    let viewInst = "select * from instructor ORDER BY firstName ASC";
    connection.query(viewInst, async (error, rows) => {
        if (error) {
            return res.send(error.message)
        }
        await fetchInstructorSubjects(rows);
        res.send(rows)
    })
})
app.delete("/instructor/:id/:status", (req, res) => {
    let {id, status} = req.params;
    let updateStatus = `UPDATE instructor SET status='${status}' WHERE id=${id}`;
    connection.query(updateStatus, (error) => {
        if (error) {
            res.send(error.message);
        } else {
            res.send("Instructor status updated successfully.");
        }
    })
})
app.post('/instructor', (req, res) => {
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let gender = req.body.gender;
    let qualification = req.body.qualification;
    let experience = req.body.experience;
    let subjects = req.body.subjects;
    let email = req.body.email;
    let mobile = req.body.mobile;
    let address = req.body.address;
    let password = generateRandomPassword(6);

    let check_mobile = "Select * From instructor Where mobile='" + mobile + "'";
    connection.query(check_mobile, (error, row) => {
        if (error) {
            res.send(error.message);
        } else {
            if (row.length > 0) {
                if (row[0].email === email) {
                    res.send("Email already exists.");
                } else {
                    res.send("Mobile number already exists.");
                }
            } else {
                let photo = req.files.profilePhoto;
                let serverPath = `images/instructors/` + photo.name;
                let dbPath = `instructors/` + photo.name;

                photo.mv(serverPath, (e) => {
                    if (e) {
                        return res.send(e.message);
                    }
                    let insertInstructor = "INSERT INTO instructor VALUES(null, '" + firstName + "', '" + lastName + "', '" + dbPath + "', '" + email + "', '" + password + "', '" + mobile + "', '" + gender + "', '" + qualification + "','" + address + "','" + experience + "','" + subjects + "', 'Active')";
                    connection.query(insertInstructor, async (error) => {
                        if (error) {
                            res.send(error.message);
                        } else {
                            let {username, usertype} = req.session.admin_data;

                            /* send email to instructor */
                            let emailSubject = 'New Instructor Added to Online Examination System - Login Details Included';
                            let htmlMessage = `<h4>Dear ${firstName}</h4>`;
                            htmlMessage += `<p>I trust this message finds you well. We are thrilled to announce the addition of a new instructor to Online Examination System Website</p><br>`
                            htmlMessage += `<b>Your Login Details:</b>`
                            htmlMessage += `<table style="border: 1px solid #000; border-collapse: collapse; padding: 5px">`;
                            htmlMessage += `<tr><td style="border: 1px solid #000; border-collapse: collapse; padding: 5px">Email</td> <td style="border: 1px solid #000; border-collapse: collapse; padding: 5px">${email}</td></tr>`;
                            htmlMessage += `<tr><td style="border: 1px solid #000; border-collapse: collapse; padding: 5px">Password</td> <td style="border: 1px solid #000; border-collapse: collapse; padding: 5px">${password}</td></tr>`;
                            htmlMessage += `</table><br>`;
                            htmlMessage += `<b>Please follow these steps to get started:</b><br>`;
                            htmlMessage += `<span>1. Visit our website: http://localhost:3000/instructor-login</span><br>`;
                            htmlMessage += `<span>2. Enter your provided email and temporary password.</span> <br>`;
                            htmlMessage += `<span>3. Click on the "Login" button.</span><br>`;
                            htmlMessage += `<p>Once you've successfully logged in, you can explore the instructor's profile, view their courses, and engage with the learning materials they've prepared.</p>`;
                            await sendEmailToUser(email, emailSubject, htmlMessage);
                            res.send("Success");
                        }
                    })
                })

            }
        }
    })
})
app.get('/student-subjects-fetch/:studentID', fetchCoursesOfThisStudent)
app.get('/student-subjects/:studentID/:subjectID', addNewSubjectOfStudent)
app.get('/student-disable/:id/:status', disableStudents)
app.get('/student-view', fetchStudents)
app.delete('/student/:studentID/:subjectID', deleteSubjectOfStudent)
app.post('/student', addNewStudent)
app.post('/admin-change-password', updatePassword)
app.post("/verify-admin-username", verifyAdminUsername);
app.get("/fetch-students-marks/:examSubjectID", fetchSubjectMarks);
app.get("/admin-fetch-results", adminExamResults);

// Logout
app.get("/admin-logout", isAdminLoggedIn, adminLogout);

// Render Pages
app.get("/admin-results", adminViewResults);
app.get("/admin-forgot-password", renderAdminForgotPasswordView);
app.get('/student', isAdminLoggedIn, manageStudents)
app.get("/instructor", isAdminLoggedIn, manageInstructor);
app.get("/subject", isAdminLoggedIn, manageSubject);
app.get("/course", isAdminLoggedIn, manageCourse)
app.get("/admin", isAdminLoggedIn, manageAdmin)
app.get("/admin-change-password", isAdminLoggedIn, renderChangePasswordView);
app.get("/admin-dashboard", isAdminLoggedIn, adminDashboard);

/* ADMIN ROUTES (end) */

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
app.post('/reset-password', (req, res) => {
    let {password, password2, email, type} = req.body
    if (password !== password2) {
        return res.json({errorCode: 2, message: 'Password mismatch'})
    }

    let updatePass = ``
    if (type === 'student') {
        updatePass = `UPDATE students SET password='${password}' WHERE email='${email}'`
    } else if (type === 'admin') {
        updatePass = `UPDATE admin_table SET password='${password}' WHERE username='${email}'`
    } else {
        updatePass = `UPDATE instructor SET password='${password}' WHERE email='${email}'`
    }

    connection.query(updatePass, (e, row) => {
        if (e) {
            return res.json({errorCode: 1, message: e.message})
        }
        res.json({errorCode: 3, message: 'Password updated successfully'})
    })
})
app.get("/reset-password", (req, res) => res.sendFile(path.join(__dirname + "/html-files/reset-password.html")));

app.post("/verify-otp", (req, res) => {
    let {otp, email, type} = req.body

    let sqlQuery = ``
    if (type === 'student') {
        sqlQuery = `SELECT * FROM students WHERE email='${email}'`
    } else if (type === 'admin') {
        sqlQuery = `SELECT * FROM admin_table WHERE username='${email}'`
    } else {
        sqlQuery = `SELECT * FROM instructor WHERE email='${email}'`
    }

    connection.query(sqlQuery, (e, row) => {
        if (e) {
            return res.json({errorCode: 1, message: e.message})
        }
        if (row[0].otp !== otp) {
            return res.json({errorCode: 2, message: 'Invalid OTP'})
        }

        let removeOTP = ``
        if (type === 'student') {
            removeOTP = `UPDATE students SET otp=null WHERE email='${email}'`
        } else if (type === 'admin') {
            removeOTP = `UPDATE admin_table SET otp=null WHERE username='${email}'`
        } else {
            removeOTP = `UPDATE instructor SET otp=null WHERE email='${email}'`
        }

        connection.query(removeOTP, (e) => {
            if (e) {
                return res.json({errorCode: 1, message: e.message})
            }
            res.json({errorCode: 3, message: 'OTP Verified Successfully'})
        })
    })
});
app.get("/verify-otp", (req, res) => res.sendFile(path.join(__dirname + "/html-files/otp.html")));
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

/* PUBLIC ROUTES */
const directoryPath = path.dirname(__dirname);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + "/html-files/student-login.html"))
})
/* PUBLIC ROUTES (end) */

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

// app.get("/firstpage", isAdminLoggedIn, (req, res) => {
//     res.sendFile(path.join(__dirname + "/html-files/success.html"))
// })

// app.get("/thirdpage", isStudentLoggedIn, (req, res) => {
//     res.sendFile(path.join(__dirname + "/html-files/success.html"))
// })

app.get("/admin-login", (req, res) => {
    res.sendFile(path.join(__dirname + "/html-files/admin-login.html"))
})

app.get("/instructor-login", (req, res) => {
    res.sendFile(path.join(__dirname + "/html-files/instructor-login.html"))
})


// app.get("/homepage", (req, res) => {
//     res.sendFile(path.join(__dirname + "/html-files/nav.html"))
// })

app.post("/update-record/:username", (req, res) => {
    let username = req.params.username;                                                                //uusername here and  upper
    let fullname = req.body.fullname;
    let email = req.body.email;
    let usertype = req.body.usertype;
    let updateAdmin = "UPDATE admin_table SET fullname='" + fullname + "', email='" + email + "', usertype='" + usertype + "' WHERE username='" + username + "'";
    console.log(updateAdmin);
    connection.query(updateAdmin, (error) => {
        if (error) {
            res.send(error.message);
            // console.log(error.message);
        } else {
            // console.log("Data Updated");
            res.send("Data Updated")
        }
    })
})

app.post('/admin-login', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let validateAdmin = "SELECT * FROM admin_table WHERE username='" + username + "' AND password='" + password + "'";
    connection.query(validateAdmin, (error, row) => {
        if (error) {
            res.send(error.message)
        } else {
            if (row.length === 0) {
                res.send("Invalid username or password")
            } else {
                if (row[0].statusl === 'inactive') {
                    res.send("Login blocked by Admin")
                } else {
                    req.session.admin_data = {username, fullname: row[0].fullname, usertype: row[0].usertype}
                    res.send("Success")
                }
            }
        }
    })
})

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return next(err);
        } else {
            return res.redirect('/admin-login')
        }
    })
})

app.post('/instructor-login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let validateInstructor = "SELECT * FROM instructor WHERE email='" + email + "' AND password='" + password + "'";
    connection.query(validateInstructor, (error, row) => {
        if (error) {
            res.send(error.message)
        } else {
            if (row.length === 0) {
                res.send("Invalid email or password")
            } else {
                if (row[0].status === 'Active') {
                    req.session.instructor_data = {
                        inst_id: row[0].id,
                        email: email,
                        name: row[0].firstName,
                        subjects: row[0].subjects
                    }
                    res.send("Success")
                } else {
                    res.send("Login blocked by Website Administrator")
                }
            }
        }
    });
})

app.post("/update-inst-record/:id", (req, res) => {
    // console.log(req.body);
    let id = req.params.id;
    let uiname = req.body.inst_name;
    let uiemail = req.body.email;
    let uimobile = req.body.mobile_no;
    let uigender = req.body.gender;
    let uiqual = req.body.qualification;
    let uiaddress = req.body.address;
    let uiexp = req.body.experience;
    let updateInst = "UPDATE instructor SET inst_name ='" + uiname + "', email='" + uiemail + "', mobile_no='" + uimobile + "',gender='" + uigender + "',qualification='" + uiqual + "',address='" + uiaddress + "',experience='" + uiexp + "' WHERE id= " + id + "";
    // console.log(updateInst);
    connection.query(updateInst, (error) => {
        if (error) {
            res.send(error.message);
            // console.log(error.message);
        } else {
            // console.log("Data Updated");
            res.send("Data Updated successfully");
        }
    })
})

app.get('/view-questions', (req, res) => {
    let viewQuestion = "select * from questions";
    connection.query(viewQuestion, (error, rows) => {
        if (error) {
            res.send(error.message)
        } else {
            res.send(rows)
        }
    })
});

app.post('/update-questions/:qid', (req, res) => {
    //console.log(req.body);
    let qid = req.params.qid;
    let question = req.body.question;
    let option_a = req.body.option_a;
    let option_b = req.body.option_b;
    let option_c = req.body.option_c;
    let option_d = req.body.option_d;
    let correct_answer = req.body.correct_answer;
    let updateQues = "UPDATE questions SET question ='" + question + "', option_a ='" + option_a + "', option_b ='" + option_b + "', option_c = '" + option_c + "', option_d ='" + option_d + "', correct_answer ='" + correct_answer + "' WHERE qid = '" + qid + "'";
    //console.log(updateQues);
    connection.query(updateQues, (error) => {
        if (error) {
            console.log(error.message);
            res.send(error.message);
        } else {
            console.log("Question updated successfully")
            res.send("Question updated successfully.")
        }
    })
})

app.post('/insert-student', (req, res) => {
    // console.log(req.body);
    let email = req.body.email;
    let phone = req.body.phone;
    let check_data = "SELECT * FROM students WHERE email='" + email + "'";
    //console.log(check_data)
    connection.query(check_data, (error, row) => {
        if (error) {
            res.send(error.message);
        } else {
            if (row.length > 0) {
                res.send("Student email id already exists");
            } else {
                let photo = req.files.photo;
                let serverPath = "images/" + photo.name;
                photo.mv(serverPath, (error) => {
                    if (error) {
                        console.log(error.message)
                    } else {
                        let fullname = req.body.fullname;
                        let gender = req.body.gender;
                        let course = req.body.course;
                        let password = req.body.password;
                        let photoPathDB = "images/" + photo.name;
                        let insertStudent = "INSERT INTO students VALUES('" + email + "', '" + password + "', '" + fullname + "','" + gender + "','" + photoPathDB + "','" + course + "','" + phone + "')";
                        //console.log(insertStudent);
                        connection.query(insertStudent, (error) => {
                            if (error) {
                                res.send(error.message);
                            } else {
                                res.send("Account created successfully...");
                            }
                        })
                    }
                })
            }
        }
    })
})


app.listen(port, (e) => {
    if (e) {
        console.log(e)
    }
    console.log("Server connected on port", port)
});

