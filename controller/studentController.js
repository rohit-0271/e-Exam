let path = require('path')
let nodeMailer = require('nodemailer')
const directoryPath = path.dirname(__dirname);
const connection = require('../config/db');

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

/* generate password */
function generateRandomPassword(length) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
}

/* generate password (end) */

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

const checkExamIsAlreadyGiven = (rows, studentID) => {
    return new Promise((resolve, reject) => {
        let counter = 0
        for (let i = 0; i < rows.length; i++) {
            let {exams} = rows[i]
            if (exams.length > 0) {
                let examSubjectID = exams[0].id
                let fetchData = `SELECT * FROM exam_result WHERE examSubjectID=${examSubjectID} AND studentID=${studentID}`
                connection.query(fetchData, (e, examRow) => {
                    if (e) return reject(e)
                    rows[i]['isExamAlreadyGiven'] = examRow.length > 0;
                    counter++;
                    if (counter === rows.length) {
                        resolve(rows)
                    }
                })
            } else {
                rows[i]['isExamAlreadyGiven'] = false
                counter++;
                if (counter === rows.length) {
                    resolve(rows)
                }
            }
        }
    })
}

const upcomingExamsOfThisStudent = (rows) => {
    return new Promise((resolve, reject) => {
        let counter = 0;
        for (let i = 0; i < rows.length; i++) {
            let {subjectID} = rows[i];
            let getSubjects = `SELECT assign_subject_to_exam.id, assign_subject_to_exam.examID, assign_subject_to_exam.subjectID, assign_subject_to_exam.total_number_of_questions, exam.examName, exam.examCode, exam.instructions, subject.sName, DATE_FORMAT(exam.date, '%Y-%m-%d') as date, exam.total_time_in_minutes FROM assign_subject_to_exam 
                                      INNER JOIN exam ON assign_subject_to_exam.examID=exam.examID
                                      INNER JOIN subject ON assign_subject_to_exam.subjectID=subject.sID
                                      WHERE assign_subject_to_exam.subjectID=${subjectID} AND exam.date >= CURDATE()`;
            connection.query(getSubjects, (e, subjectRow) => {
                if (e) return reject(e)
                rows[i]['exams'] = subjectRow;
                counter++;
                if (counter === rows.length) {
                    resolve(rows)
                }
            });
        }
    })
}

const getNumberOfQuestion = (rows) => {
    return new Promise((resolve, reject) => {
        let counter = 0
        for (let i = 0; i < rows.length; i++) {
            let {exams} = rows[i]
            if (exams.length > 0) {
                let {id} = exams[0]
                let getCountQues = `SELECT * FROM assign_subject_question_to_exam WHERE examSubjectID=${id}`
                connection.query(getCountQues, (e, row) => {
                    if (e) return reject(e)
                    rows[i]['number_of_question_assigned_to_exam'] = row
                    counter++;
                    if (counter === rows.length) {
                        resolve(rows)
                    }
                })
            } else {
                rows[i]['number_of_question_assigned_to_exam'] = []
                counter++;
                if (counter === rows.length) {
                    resolve(rows)
                }
            }
        }
    })
}

/*
------------------------------------------------------------------------
-> RENDER PAGES
------------------------------------------------------------------------
*/

const studentLogout = (req, res) => {
    delete req.session.student_data;
    res.redirect('/student-login');
}

const renderLoginPage = (req, res) => {
    res.sendFile(directoryPath + "/html-files/student-login.html")
}

const renderStudentDashboard = (req, res) => {
    res.sendFile(directoryPath + "/html-files/student-dashboard.html")
}

const renderStudentProfile = (req, res) => {
    res.sendFile(directoryPath + "/html-files/student-profile.html")
}

const renderStudentExams = (req, res) => {
    res.sendFile(directoryPath + "/html-files/student-exams.html")
}

const renderStudentResult = (req, res) => {
    res.sendFile(directoryPath + "/html-files/student-result.html")
}

const renderStudentChangePasswordView = (req, res) => {
    res.sendFile(directoryPath + "/html-files/student-change-password.html")
}

const renderStudentForgotPasswordView = (req, res) => {
    res.sendFile(directoryPath + "/html-files/student-forgot-password.html")
}


/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

const studentLoginHandler = (req, res) => {
    let {email, password} = req.body
    let validateStudent = `SELECT * FROM students WHERE email='${email}' AND password='${password}'`
    connection.query(validateStudent, (error, row) => {
        if (error) {
            return res.send(error.message)
        }
        if (row.length === 0) {
            return res.send("Invalid email or password.")
        }
        if (row[0].status === 'Inactive') {
            return res.send("Your login is blocked by Admin.")
        }
        req.session.student_data = {id: row[0].id, email, firstName: row[0].firstName}
        res.send("Success")
    })
}

const getProfileData = (req, res) => {
    let {id} = req.session.student_data;
    let fetchData = `select * from students where id=${id}`
    connection.query(fetchData, (e, row) => {
        if (e) {
            return res.json({error: true, message: e.message, row: []})
        }
        res.json({error: false, message: 'Data fetched.', row: row})
    })
}

const getCourseOfThisStudent = (req, res) => {
    let {id} = req.session.student_data;
    let fetchSubjects = `SELECT CONCAT('{"courseName":"', course.courseName, '","courseLogo":"', course.courseLogo, '"}') AS Course, 
                                CONCAT('[', GROUP_CONCAT(CONCAT('{"subject_logo":"', subject.sLogo, '","subject_name":"', subject.sName, '","subject_id":"', subject.sID, '","subject_desc":"', subject.sDescription, '","subject_code":"', subject.sCode,  '"}')), ']') AS Selected_Subjects
                                FROM student_subjects 
                                INNER JOIN students ON student_subjects.studentID=students.id
                                INNER JOIN subject ON student_subjects.subjectID=subject.sID 
                                INNER JOIN course ON subject.courseID=course.courseID
                                WHERE student_subjects.studentID=${id}
                                GROUP BY course.courseName, course.courseLogo`;
    connection.query(fetchSubjects, (e, rows) => {
        if (e) {
            return res.json({error: true, message: e.message, rows: []})
        }
        res.json({error: false, message: 'Data fetched', rows: rows})
    })
}

const fetchUpcomingExams = (req, res) => {
    let {id} = req.session.student_data;
    let fetchData = `select subjectID from student_subjects where studentID=${id}`
    connection.query(fetchData, async (e, rows) => {
        if (e) {
            return res.json({error: true, message: e.message, row: []})
        }
        await upcomingExamsOfThisStudent(rows)
        await checkExamIsAlreadyGiven(rows, id)
        await getNumberOfQuestion(rows)
        res.json({error: false, message: 'Data fetched.', rows: rows})
    })
}

function getQuestionFromDB(rows) {
    return new Promise((resolve, reject) => {
        let {questions} = rows
        let ques = `SELECT * FROM subject_questions WHERE qid IN(${questions})`
        connection.query(ques, (e, quesRows) => {
            if (e) return reject(e)
            resolve(quesRows)
        })
    })
}

const getExamQuestions = (req, res) => {
    let {examSubjectID} = req.params
    let getQuesIds = `SELECT * FROM assign_subject_question_to_exam WHERE examSubjectID=${examSubjectID}`
    connection.query(getQuesIds, async (e, rows) => {
        if (e) {
            return res.json({error: true, message: e.message, rows: []})
        }
        try {
            let data = await getQuestionFromDB(rows[0])
            res.json({error: false, message: 'Data fetched.', rows: data})
        } catch (e) {
            res.json({error: true, message: e.message, rows: []})
        }
    })
}

const saveMyResult = (req, res) => {
    let {id} = req.session.student_data;
    let {examSubjectID, totalScore, obtainedScore} = req.body
    let saveResult = `INSERT INTO exam_result VALUES(null, ${examSubjectID}, ${id}, ${totalScore}, ${obtainedScore})`
    connection.query(saveResult, (e) => {
        if (e) {
            return res.send(e.message)
        }
        res.send('success')
    })
}

function getStudentResult(req, res) {
    let {id} = req.session.student_data;
    let fetchResult = `SELECT exam_result.totalScore, exam_result.obtainedScore, exam.examCode, exam.examName, subject.sName, subject.sLogo FROM exam_result 
                              INNER JOIN assign_subject_to_exam ON exam_result.examSubjectID=assign_subject_to_exam.id
                              INNER JOIN exam ON assign_subject_to_exam.examID=exam.examID
                              INNER JOIN subject ON assign_subject_to_exam.subjectID=subject.sID
                              WHERE studentID=${id}`
    connection.query(fetchResult, (e, rows) => {
        if (e) {
            return res.json({error: true, message: e.message, rows: []})
        }
        res.json({error: false, message: 'Data fetched.', rows: rows})
    })
}

const updateStudentPassword = (req, res) => {
    let {passwordOld, passwordNew, passwordRepeat} = req.body
    let {id} = req.session.student_data
    let checkOldPass = `SELECT * FROM students WHERE id=${id} AND password='${passwordOld}'`
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
        let updatePass = `UPDATE students SET password='${passwordNew}' WHERE id=${id}`
        connection.query(updatePass, (e) => {
            if (e) {
                return res.json({errorCode: 1, message: e.message})
            }
            res.json({errorCode: 3, message: 'Password updated successfully.'})
        })
    })
}

const verifyStudentEmail = (req, res) => {
    let {emailStudent} = req.body
    let studentExist = `SELECT * FROM students WHERE email='${emailStudent}'`
    connection.query(studentExist, (e, row) => {
        if (e) {
            return res.send({errorCode: 1, message: e.message})
        }
        if (row.length === 0) {
            return res.send({errorCode: 2, message: 'Invalid Email'})
        }

        let OTP = generateOTP(6) // generate OTP

        let saveOTP = `UPDATE students SET otp='${OTP}' WHERE id=${row[0].id}`
        connection.query(saveOTP, async (e) => {
            if (e) {
                return res.send({errorCode: 1, message: e.message})
            }

            /* send email to instructor */
            let htmlMessage = `<h4 style="text-transform: capitalize">Dear ${row[0].firstName}</h4>`;
            htmlMessage += `<p>OTP is ${OTP}</p>`

            await sendEmailToUser(emailStudent, 'Forgot Password | Student', htmlMessage)
            res.send({errorCode: 3, message: 'Verified'})
        })
    })
}

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

module.exports = {
    verifyStudentEmail,
    renderStudentForgotPasswordView,
    updateStudentPassword,
    renderStudentChangePasswordView,
    getStudentResult,
    renderStudentResult,
    saveMyResult,
    getExamQuestions,
    renderStudentExams,
    fetchUpcomingExams,
    getCourseOfThisStudent,
    getProfileData,
    renderStudentProfile,
    renderStudentDashboard,
    studentLoginHandler,
    renderLoginPage,
    studentLogout
}