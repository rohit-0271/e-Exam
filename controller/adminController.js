let path = require('path')
let nodeMailer = require('nodemailer')
const directoryPath = path.dirname(__dirname);
const connection = require('../config/db');

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

/* send email */
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

/* send email (end) */

/* save file on server */
async function saveFile(file, folderName) {
    try {
        let serverPath = `images/${folderName}/${file.name}`
        await file.mv(serverPath)
        return 'success';
    } catch (e) {
        return 'error';
    }
}

/* save file on server (end) */

/* generate random password */
function generateRandomPassword(length) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
}

/* generate random password (end) */

/* generate OTP */
function generateOTP(length) {
    const charset = "0123456789";
    let otp = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        otp += charset[randomIndex];
    }
    return otp;
}

/* generate OTP (end) */

/* ------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------ */

function adminViewResults(req, res) {
    res.sendFile(directoryPath + "/html-files/admin-view-results.html")
}


function adminDashboard(req, res) {
    res.sendFile(directoryPath + "/html-files/admin-dashboard.html")
}

function manageAdmin(req, res) {
    res.sendFile(directoryPath + "/html-files/add-admin-form.html")
}

function manageCourse(req, res) {
    res.sendFile(directoryPath + "/html-files/course.html")
}


function manageSubject(req, res) {
    res.sendFile(directoryPath + "/html-files/category-form.html")
}

function manageInstructor(req, res) {
    res.sendFile(directoryPath + "/html-files/instructor.html")
}

const manageStudents = (req, res) => {
    res.sendFile(directoryPath + "/html-files/students.html")
}

const renderChangePasswordView = (req, res) => {
    res.sendFile(directoryPath + "/html-files/admin-change-password.html")
}

const renderAdminForgotPasswordView = (req, res) => {
    res.sendFile(directoryPath + "/html-files/admin-forgot-password.html")
}

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

const addNewStudent = (req, res) => {
    let {firstName, lastName, fatherName, gender, email, mobile, address} = req.body
    let file = req.files.profilePhoto

    let checkAlreadyExists = `SELECT * FROM students WHERE email='${email}' OR phone='${mobile}'`
    connection.query(checkAlreadyExists, async (e, rows) => {
        if (e) {
            return res.send(e.message);
        } else if (rows.length > 0) {
            return res.send('Duplicate email address or mobile number.');
        } else {
            let response = await saveFile(file, 'students')
            if (response === 'error') {
                return res.send('Error occurred during file uploading.')
            }

            let dbPath = `students/${file.name}`
            let password = generateRandomPassword(6)

            let createStudent = `INSERT INTO students VALUES(null, '${email}','${password}','${firstName}','${lastName}','${fatherName}','${gender}','${dbPath}','${mobile}','${address}', 'Active')`
            connection.query(createStudent, async (e) => {
                if (e) {
                    console.log(e.message)
                    return res.send(e.message);
                }

                /* send email to instructor */
                let emailSubject = 'New Student Added to Online Examination System - Login Details Included';
                let htmlMessage = `<h4 style="text-transform: capitalize">Dear ${firstName}</h4>`;
                htmlMessage += `<p>I trust this message finds you well. We are thrilled to announce the addition of a new student to Online Examination System Website</p><br>`
                htmlMessage += `<b>Login Details:</b>`
                htmlMessage += `<table style="border: 1px solid #000; border-collapse: collapse; padding: 5px">`;
                htmlMessage += `<tr><td style="border: 1px solid #000; border-collapse: collapse; padding: 5px">Email</td> <td style="border: 1px solid #000; border-collapse: collapse; padding: 5px">${email}</td></tr>`;
                htmlMessage += `<tr><td style="border: 1px solid #000; border-collapse: collapse; padding: 5px">Password</td> <td style="border: 1px solid #000; border-collapse: collapse; padding: 5px">${password}</td></tr>`;
                htmlMessage += `</table><br>`;
                htmlMessage += `<b>Please follow these steps to get started:</b><br>`;
                htmlMessage += `<span>1. Visit our website: http://localhost:3000/student-login</span><br>`;
                htmlMessage += `<span>2. Enter your provided email and temporary password.</span> <br>`;
                htmlMessage += `<span>3. Click on the "Login" button.</span><br>`;
                htmlMessage += `<p>Once you've successfully logged in, you can explore your profile, view your courses, and engage with the learning materials they've prepared.</p>`;

                await sendEmailToUser(email, emailSubject, htmlMessage);
                res.send('Success')
            })
        }
    })

}

const fetchStudents = (req, res) => {
    let getStudents = `SELECT * FROM students ORDER BY firstName ASC`
    connection.query(getStudents, (e, rows) => {
        if (e) {
            return res.json({error: true, message: e.message, data: []})
        }
        res.json({error: false, message: 'Data fetched', data: rows})
    })
}

const adminLogout = (req, res) => {
    delete req.session.admin_data;
    res.redirect('/admin-login');
}

const disableStudents = (req, res) => {
    let {id, status} = req.params
    let updateStatus = `UPDATE students SET status='${status}' WHERE id=${id}`
    connection.query(updateStatus, (e) => {
        if (e) {
            return res.json({error: true, message: e.message})
        }
        res.json({error: false, message: 'Success'})
    })
}

const addNewSubjectOfStudent = (req, res) => {
    let {studentID, subjectID} = req.params
    let checkSubjectAlreadyExistsOrNot = `SELECT * FROM student_subjects WHERE studentID=${studentID} AND subjectID=${subjectID}`
    connection.query(checkSubjectAlreadyExistsOrNot, (e, row) => {
        if (e) {
            return res.send(e.message)
        }
        if (row.length > 0) {
            return res.send('Subject already exists.')
        }
        let saveSubjectOfStudent = `INSERT INTO student_subjects VALUES(null, ${studentID}, ${subjectID})`
        connection.query(saveSubjectOfStudent, (e) => {
            if (e) {
                return res.send(e.message)
            }
            res.send("Success")
        })
    })
}

const fetchCoursesOfThisStudent = (req, res) => {
    let {studentID} = req.params
    let fetchSubjects = `SELECT CONCAT('{"courseName":"', course.courseName, '","courseLogo":"', course.courseLogo, '"}') AS Course, 
                                CONCAT('[', GROUP_CONCAT(CONCAT('{"subject_logo":"', subject.sLogo, '","subject_name":"', subject.sName, '","subject_id":"', subject.sID, '","subject_desc":"', subject.sDescription, '","subject_code":"', subject.sCode,  '"}')), ']') AS Selected_Subjects
                                FROM student_subjects 
                                INNER JOIN students ON student_subjects.studentID=students.id
                                INNER JOIN subject ON student_subjects.subjectID=subject.sID 
                                INNER JOIN course ON subject.courseID=course.courseID
                                WHERE student_subjects.studentID=${studentID}
                                GROUP BY course.courseName, course.courseLogo`;
    connection.query(fetchSubjects, async (e, rows) => {
        if (e) {
            return res.json({error: true, message: e.message, rows: []})
        }
        res.json({error: false, message: 'Data fetched', rows: rows})
    })
}

const deleteSubjectOfStudent = (req, res) => {
    let {studentID, subjectID} = req.params
    let deleteSubject = `DELETE FROM student_subjects WHERE studentID=${studentID} AND subjectID=${subjectID}`
    connection.query(deleteSubject, (e) => {
        if (e) {
            return res.send(e.message)
        }
        res.send('Success')
    })
}


function getTotalCourses(row) {
    return new Promise((resolve, reject) => {
        let totalCourses = `SELECT COUNT(*) AS totalCourses FROM course`
        connection.query(totalCourses, async (e, rowCourse) => {
            if (e) return reject(e.message)
            // await (row.push(rowCourse[0]))
            await (row[0]['totalCourses'] = rowCourse[0].totalCourses)
            await resolve(row)
        })
    })
}

function getTotalSubjects(row) {
    return new Promise((resolve, reject) => {
        let totalSubjects = `SELECT COUNT(*) AS totalSubjects FROM subject`
        connection.query(totalSubjects, async (e, rowCourse) => {
            if (e) return reject(e.message)
            // await (row.push(rowCourse[0]))
            await (row[0]['totalSubjects'] = rowCourse[0].totalSubjects)
            await resolve(row)
        })
    })
}

function getTotalInstructors(row) {
    return new Promise((resolve, reject) => {
        let totalInstructors = `SELECT COUNT(*) AS totalInstructors FROM instructor`
        connection.query(totalInstructors, async (e, rowCourse) => {
            if (e) return reject(e.message)
            // await (row.push(rowCourse[0]))
            await (row[0]['totalInstructors'] = rowCourse[0].totalInstructors)
            await resolve(row)
        })
    })
}

function getTotalStudents(row) {
    return new Promise((resolve, reject) => {
        let totalStudents = `SELECT COUNT(*) AS totalStudents FROM students`
        connection.query(totalStudents, async (e, rowCourse) => {
            if (e) return reject(e.message)
            // await (row.push(rowCourse[0]))
            await (row[0]['totalStudents'] = rowCourse[0].totalStudents)
            await resolve(row)
        })
    })
}

function getTotalExams(row) {
    return new Promise((resolve, reject) => {
        let totalExams = `SELECT COUNT(*) AS totalExams FROM exam`
        connection.query(totalExams, async (e, rowCourse) => {
            if (e) return reject(e.message)
            // await (row.push(rowCourse[0]))
            await (row[0]['totalExams'] = rowCourse[0].totalExams)
            await resolve(row)
        })
    })
}

const getTotalCounts = (req, res) => {
    let totalAdmins = `SELECT COUNT(*) AS totalAdmins FROM admin_table`
    connection.query(totalAdmins, async (e, row) => {
        if (e) return res.json({error: true, message: e.message, rows: []})
        try {
            await getTotalCourses(row)
            await getTotalSubjects(row)
            await getTotalInstructors(row)
            await getTotalStudents(row)
            await getTotalExams(row)
            res.json({error: false, message: '', rows: row[0]})
        } catch (e) {
            res.json({error: true, message: e, rows: []})
        }
    })
}

const updatePassword = (req, res) => {
    let {passwordOld, passwordNew, passwordRepeat} = req.body
    let {username} = req.session.admin_data
    let checkOldPass = `SELECT * FROM admin_table WHERE username='${username}' AND password='${passwordOld}'`
    connection.query(checkOldPass, (e, row) => {
        if (e) {
            return res.json({errorCode: 1, message: e.message})
        }
        if (row.length === 0) {
            return res.json({errorCode: 2, message: 'Invalid old password.'})
        }
        if (passwordNew !== passwordRepeat) {
            return res.json({errorCode: 2, message: 'Password mismatch.'})
        }
        let updatePass = `UPDATE admin_table SET password='${passwordNew}' WHERE username='${username}'`
        connection.query(updatePass, (e) => {
            if (e) {
                return res.json({errorCode: 1, message: e.message})
            }
            res.json({errorCode: 3, message: 'Password updated successfully.'})
        })
    })
}

const verifyAdminUsername = (req, res) => {
    let {adminUsername} = req.body
    let isAdminExist = `SELECT * FROM admin_table WHERE username='${adminUsername}'`
    connection.query(isAdminExist, (e, row) => {
        if (e) {
            return res.send({errorCode: 1, message: e.message})
        }
        if (row.length === 0) {
            return res.send({errorCode: 2, message: 'Invalid Username'})
        }

        let OTP = generateOTP(6) // generate OTP

        let saveOTP = `UPDATE admin_table SET otp='${OTP}' WHERE username='${adminUsername}'`
        connection.query(saveOTP, async (e) => {
            if (e) {
                return res.send({errorCode: 1, message: e.message})
            }

            /* send email to instructor */
            let htmlMessage = `<h4 style="text-transform: capitalize">Dear ${row[0].fullname}</h4>`;
            htmlMessage += `<p>OTP is ${OTP}</p>`

            await sendEmailToUser(row[0].email, 'Forgot Password | Student', htmlMessage)
            res.send({errorCode: 3, message: 'Verified'})
        })
    })
}

const adminExamResults = (req, res) => {
    let getExams = `SELECT assign_subject_to_exam.*, exam.*, subject.sName FROM assign_subject_to_exam INNER JOIN subject ON assign_subject_to_exam.subjectID=subject.sID INNER JOIN exam ON assign_subject_to_exam.examID=exam.examID`
    connection.query(getExams, (e, rows) => {
        if (e) {
            return res.json({errorCode: 1, message: e.message, rows: []})
        }
        res.json({errorCode: 2, message: 'Data fetched', rows: rows})
    })
}

const fetchSubjectMarks = (req, res) => {
  let {examSubjectID} = req.params
    let getMarks = `SELECT exam_result.*, students.firstName, students.lastName, students.fatherName, students.gender, students.photo FROM exam_result INNER JOIN students ON exam_result.studentID=students.id WHERE exam_result.examSubjectID=${examSubjectID}`
    connection.query(getMarks, (e, rows) => {
        if (e) {
            return res.json({errorCode: 1, message: e.message, rows: []})
        }
        res.json({errorCode: 2, message: 'Data fetched', rows: rows})
    })
}

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

module.exports = {
    fetchSubjectMarks,
    adminExamResults,
    adminViewResults,
    verifyAdminUsername,
    renderAdminForgotPasswordView,
    updatePassword,
    renderChangePasswordView,
    getTotalCounts,
    deleteSubjectOfStudent,
    fetchCoursesOfThisStudent,
    addNewSubjectOfStudent,
    disableStudents,
    fetchStudents,
    addNewStudent,
    manageStudents,
    manageCourse,
    manageInstructor,
    manageSubject,
    manageAdmin,
    adminDashboard,
    adminLogout
}