let path = require('path')
const connection = require('../config/db');
const nodeMailer = require("nodemailer");
const directoryPath = path.dirname(__dirname);

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

const Logout = (req, res) => {
    delete req.session.instructor_data;
    res.redirect('/instructor-login');
}

const instructorDashboard = (req, res) => {
    res.sendFile(directoryPath + "/html-files/instructor-dashboard.html")
}

const manageQuestions = (req, res) => {
    res.sendFile(directoryPath + "/html-files/question.html")
}

const manageExams = (req, res) => {
    res.sendFile(directoryPath + "/html-files/exam.html")
}

const viewExams = (req, res) => {
    res.sendFile(directoryPath + "/html-files/exam-view.html")
}

const renderInstructorChangePasswordView = (req, res) => {
    res.sendFile(directoryPath + "/html-files/instructor-change-password.html")
}

const renderInstructorForgotPasswordView = (req, res) => {
    res.sendFile(directoryPath + "/html-files/instructor-forgot-password.html")
}

function instructorViewResults(req, res) {
    res.sendFile(directoryPath + "/html-files/instructor-view-results.html")
}

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

function courseNameQuery(sql) {
    return new Promise((resolve, reject) => {
        connection.query(sql, (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
}

function subjectDetailsQuery(subjectsID) {
    return new Promise((resolve, reject) => {
        let subjectsArr = []
        let counter = 0
        for (let i = 0; i < subjectsID.length; i++) {
            let id = subjectsID[i]
            let getSubjectDetails = `SELECT * FROM subject WHERE sID=${id}`
            connection.query(getSubjectDetails, (error, rows) => {
                if (error) return reject(error);
                subjectsArr.push(rows[0])
                counter++
                if (counter === subjectsID.length) {
                    resolve(subjectsArr);
                }
            });
        }
    });
}

function getSubjectsAssignedToExam(rows) {
    return new Promise((resolve, reject) => {
        let counter = 0
        for (let i = 0; i < rows.length; i++) {
            let {examID} = rows[i]
            let getSubjectName = `SELECT subject.sID, subject.sName, assign_subject_to_exam.id, assign_subject_to_exam.total_number_of_questions FROM assign_subject_to_exam INNER JOIN subject ON assign_subject_to_exam.subjectID=subject.sID WHERE examID=${examID}`
            connection.query(getSubjectName, (error, subjectRow) => {
                if (error) return reject(error);
                rows[i]['subjects'] = subjectRow
                counter++
                if (counter === rows.length) {
                    resolve(rows);
                }
            });
        }
    });
}

const courseAndSubjectsOfInstructor = async (req, res) => {
    if (req.session.instructor_data) {
        try {
            let courseWithSubjects = {}
            let {subjects} = req.session.instructor_data
            subjects = subjects.split(',')

            // get subject details
            courseWithSubjects.subjects = await subjectDetailsQuery(subjects)

            // get course details
            let firstSubject = subjects[0]
            let getCourseName = `SELECT courseName FROM subject INNER JOIN course ON subject.courseID=course.courseID WHERE sID=${firstSubject}`

            let courseRow = await courseNameQuery(getCourseName,);
            courseWithSubjects.course = courseRow[0].courseName

            res.send(courseWithSubjects)
        } catch (e) {
            res.send({error: e.message})
        }
    }
}

const addNewQuestion = (req, res) => {
    // console.log(req.body);
    let {question, option_a, option_b, option_c, option_d, correct_answer, marks, subjectID} = req.body
    let check_question = "Select * From subject_questions Where question='" + question + "'";
    connection.query(check_question, (error, row) => {
        if (error) {
            return res.send(error.message);
        }
        if (row.length > 0) {
            return res.send("Question already exists.");
        }
        let insertQuestion = "INSERT INTO subject_questions VALUES(null,'" + question + "', '" + option_a + "', '" + option_b + "','" + option_c + "','" + option_d + "','" + correct_answer + "', " + marks + ", " + subjectID + ")";
        connection.query(insertQuestion, (error) => {
            if (error) {
                return res.send(error.message);
            }
            res.send("Success");
        })

    })
}

const fetchQuestions = (req, res) => {
    let {subjectID} = req.params
    let getQues = `SELECT * FROM subject_questions WHERE subjectID=${subjectID} ORDER BY qid DESC`
    connection.query(getQues, (e, rows) => {
        if (e) {
            return res.json({error: true, message: e.message, rows: []})
        }
        res.json({error: false, message: 'Data fetched.', rows: rows})
    })
}

const deleteQuestion = (req, res) => {
    let {id} = req.params;
    let deleteQuestion = `DELETE FROM subject_questions WHERE qid=${id}`;
    connection.query(deleteQuestion, (error) => {
        if (error) {
            return res.send(error.message);
        }
        res.send("Question deleted successfully.");
    })
}

const addNewExam = (req, res) => {
    let {inst_id} = req.session.instructor_data
    let {examName, examCode, instructions, examDate, totalTime} = req.body
    let checkAlreadyExists = `SELECT examCode FROM exam WHERE examCode='${examCode}'`
    connection.query(checkAlreadyExists, (e, row) => {
        if (e) {
            return res.send(e.message)
        }
        if (row.length > 0) {
            return res.send('Exam already exists.')
        }
        let createExam = `INSERT INTO exam VALUES(null, '${examCode}','${examName}','${instructions}','${examDate}','${totalTime}', ${inst_id})`
        connection.query(createExam, (e) => {
            if (e) {
                return res.send(e.message)
            }
            res.send('Success')
        })
    })

}

const viewExamsData = (req, res) => {
    // if (req.session.instructor_data) {
    let {inst_id} = req.session.instructor_data
    let getExams = `SELECT *, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM exam WHERE instructorID=${inst_id} ORDER BY examID DESC`
    connection.query(getExams, async (e, rows) => {
        if (e) {
            return res.json({error: true, message: e.message, rows: []})
        }
        await getSubjectsAssignedToExam(rows)
        res.json({error: false, message: 'Data fetched.', rows: rows})
    })
    // }
}

const assignSubjectToExam = (req, res) => {
    let {subjectID, numberOfQuestion, examID} = req.params
    let isSubjectAlreadyAssignedToExam = `SELECT * FROM assign_subject_to_exam WHERE examID= ${examID} AND subjectID=${subjectID}`
    connection.query(isSubjectAlreadyAssignedToExam, (e, row) => {
        if (e) {
            return res.send(e.message)
        }
        if (row.length > 0) {
            return res.send('This subject is already assigned to this exam.')
        }
        let saveExamSubject = `INSERT INTO assign_subject_to_exam VALUES(null, ${examID}, ${subjectID}, ${numberOfQuestion})`
        connection.query(saveExamSubject, (e) => {
            if (e) {
                return res.send(e.message)
            }
            res.send('Success')
        })
    })
}

const deleteExam = (req, res) => {
    let {examID} = req.params
    let removeExam = `DELETE FROM exam WHERE examID=${examID}`
    connection.query(removeExam, (e) => {
        if (e) {
            return res.send(e.message)
        }
        res.send('Success')
    })
}

const assignSubjectQuestionsToExam = (req, res) => {
    let {assignedSubjectToExamID, questionIDArray} = req.body

    let checkAlreadyAssigned = `SELECT * FROM assign_subject_question_to_exam WHERE examSubjectID=${assignedSubjectToExamID}`
    connection.query(checkAlreadyAssigned, (e, row) => {
        if (e) {
            return res.send(e.message)
        }
        if (row.length > 0) {
            return res.send('Already questions assigned to this exam.')
        }

        let assignQuestionToExamSubject = `INSERT INTO assign_subject_question_to_exam VALUES(null, '${questionIDArray}', ${assignedSubjectToExamID})`
        connection.query(assignQuestionToExamSubject, (e) => {
            if (e) {
                return res.send(e.message)
            }
            res.send('success')
        })
    })
}

const updateInstructorPassword = (req, res) => {
    let {passwordOld, passwordNew, passwordRepeat} = req.body
    let {inst_id} = req.session.instructor_data
    let checkOldPass = `SELECT * FROM instructor WHERE id=${inst_id} AND password='${passwordOld}'`
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
        let updatePass = `UPDATE instructor SET password='${passwordNew}' WHERE id=${inst_id}`
        connection.query(updatePass, (e) => {
            if (e) {
                return res.json({errorCode: 1, message: e.message})
            }
            res.json({errorCode: 3, message: 'Password updated successfully.'})
        })
    })
}

const verifyInstructorEmail = (req, res) => {
    let {instEmail} = req.body
    let isInstructorExist = `SELECT * FROM instructor WHERE email='${instEmail}'`
    connection.query(isInstructorExist, (e, row) => {
        if (e) {
            return res.send({errorCode: 1, message: e.message})
        }
        if (row.length === 0) {
            return res.send({errorCode: 2, message: 'Invalid Email'})
        }

        let OTP = generateOTP(6) // generate OTP

        let saveOTP = `UPDATE instructor SET otp='${OTP}' WHERE email='${instEmail}'`
        connection.query(saveOTP, async (e) => {
            if (e) {
                return res.send({errorCode: 1, message: e.message})
            }

            /* send email to instructor */
            let htmlMessage = `<h4 style="text-transform: capitalize">Dear ${row[0].fullname}</h4>`;
            htmlMessage += `<p>OTP is ${OTP}</p>`

            await sendEmailToUser(row[0].email, 'Forgot Password | Instructor', htmlMessage)
            res.send({errorCode: 3, message: 'Verified'})
        })
    })
}

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */

module.exports = {
    instructorViewResults,
    verifyInstructorEmail,
    renderInstructorForgotPasswordView,
    updateInstructorPassword,
    renderInstructorChangePasswordView,
    assignSubjectQuestionsToExam,
    deleteExam,
    assignSubjectToExam,
    viewExamsData,
    viewExams,
    addNewExam,
    deleteQuestion,
    fetchQuestions,
    addNewQuestion,
    courseAndSubjectsOfInstructor,
    manageExams,
    manageQuestions,
    instructorDashboard,
    Logout
}