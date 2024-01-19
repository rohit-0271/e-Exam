let express = require("express");
let app = express();
let path = require("path");
let mysql = require('mysql');
let fileUpload = require('express-fileupload');
let session = require('express-session')
let port = 3000
/* database connection */
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '270700',
    database: 'node_online_examination'
});
connection.connect((error) => {
    if (error) {
        console.log(error.message);
    } else {
        console.log("database connected http://localhost:3000")
    }
});

app.use(fileUpload({}));
app.use(express.json()); // json receive (frontend)
app.use(express.urlencoded({extended: false})); // post method...
app.use(express.static('css')); // style file
app.use(express.static('js'));
app.use(express.static('bootstrap')); // static files...
app.use(express.static('images')); // static files...
app.use(session(
    {
        secret: "123@abc",
        resave: false,
        saveUninitialized: false
    }
))


app.post('/add-admins', (req, res) => {
    console.log(req.body);
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
                let insertAdmin = "INSERT INTO admin_table VALUES" +
                    "('" + username + "', '" + password + "', '" + fullname + "','" + email + "','" + usertype + "','active')";
                console.log(insertAdmin);
                connection.query(insertAdmin, (error) => {
                    if (error) {
                        res.send(error.message);
                    } else {
                        res.send("admin added successfully...");
                    }
                })
            }
        }
    })
})


//     let insertAdmin = "INSERT INTO admin_table VALUES" +
//         "('" + username + "', '" + password + "', '" + fullname + "','" + email + "','" + usertype + "','active')";
//     console.log(insertAdmin);
//     connection.query(insertAdmin, (error) => {
//         if (error) {
//             res.send(error.message);
//             // console.log(error.message)
//         } else {
//             res.send("admin added successfully...");
//             //console.log("admin added successfully...");
//         }
//     })
//})


app.get("/delete-admin", (req, res) => {
    let username = req.query.q;

    let deleteAdmin = "UPDATE admin_table SET statusl='Inactive' WHERE username='" + username + "'";
    console.log(deleteAdmin);
    connection.query(deleteAdmin, (error) => {
        if (error) {
            res.send(error.message);
        } else {
            res.send("Data deleted");
        }
    })
})

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


app.get("/firstpage", isAdminLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname + "/html-files/success.html"))
})

app.get("/secondpage", isInstructorLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname + "/html-files/success.html"))
})

app.get('/thirdpage', isStudentLoggedIn, (req,res) => {
    res.sendFile(path.join(__dirname + "/html-files/success.html"))
})

app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname + "/html-files/add-admin-form.html"))
})

app.get("/category", (req, res) => {
    res.sendFile(path.join(__dirname + "/html-files/category-form.html"))
})

app.get("/inst", (req, res) => {
    res.sendFile(path.join(__dirname + "/html-files/instructor.html"))
})

app.get("/admin-login", (req, res) => {
    res.sendFile(path.join(__dirname + "/html-files/admin-login.html"))
})

app.get("/student-login", (req, res) => {
    res.sendFile(path.join(__dirname + "/html-files/student-login.html"))
})

app.get("/instructor-login", (req, res) => {
    res.sendFile(path.join(__dirname + "/html-files/instructor-login.html"))
})

app.get("/homepage", (req, res) => {
    res.sendFile(path.join(__dirname + "/html-files/nav.html"))
})

app.get("/question", (req, res) => {
    res.sendFile(path.join(__dirname + "/html-files/question.html"))
})
app.get("/student", (req, res) => {
    res.sendFile(path.join(__dirname + "/html-files/student.html"))
})

app.get('/view-admins', (req, res) => {
    let viewAdmins = "select * from admin_table";
    connection.query(viewAdmins, (error, rows) => {
        if (error) {
            res.send(error.message)
        } else {
            res.send(rows)
        }
    })
})

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
    // console.log(validateAdmin);
    connection.query(validateAdmin, (error, row) => {
        if (error) {
            res.send(error.message)
        } else {
            console.log(row.length)
            if (row.length == 0) {
                res.send("Invalid Username and password")
            } else {
                req.session.admin_data = username
                res.send("Success")
            }
        }
    })

    //req.session.destroy((err) => {
    //res.redirect('/admin-login.html')
    // })
})


/*
app.post("/admin-login",(req, res)=>{

    console.log(req.session.admin_data)
    if(req.session.admin_data){
        res.sendFile(path.join(__dirname+"/html-files/category-form.html"));
    }
    else{
        res.redirect('/admin-login.html')
    }
})
*/
app.get('/admin-logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return next(err);
        } else {
            return res.redirect('/admin-login')
        }
    })
})

app.post('/insert-category', (req, res) => {
    console.log(req.body);
    let name = req.body.name;
    let description = req.body.description;
    let checkcategory = "select * from category where name ='" + name + "' ";
    connection.query(checkcategory, (error, row) => {
        if (error) {
            res.send(error.message);
        } else {
            if (row.length > 0) {
                res.send("Category name already exists");
            } else {
                let insertCategory = "INSERT INTO category VALUES(null,'" + name + "', '" + description + "')";
                console.log(insertCategory);
                connection.query(insertCategory, (error) => {
                    if (error) {
                        res.send(error.message);
                        // console.log(error.message)
                    } else {
                        res.send("category added successfully...");
                        //console.log("admin added successfully...");
                    }
                })
            }
        }
    })
})

app.get('/view-category', (req, res) => {
    let viewCat = "select * from category";
    connection.query(viewCat, (error, rows) => {
        if (error) {
            res.send(error.message)
        } else {
            res.send(rows)
        }
    })
})

app.get('/delete-category/:id', (req, res) => {
    let id = req.params.id;
    let deleteCat = "DELETE FROM category WHERE id=" + id + "";
    connection.query(deleteCat, (error) => {
        if (error) {
            res.send(error.message)


        } else {
            res.send("1 Category Deleted...")

        }
    })
})
app.post('/insert-inst', (req, res) => {
    console.log(req.body);
    let instname = req.body.inst_name;
    let instemail = req.body.email;
    let instpassword = req.body.password;
    let mobile = req.body.mobile_no;
    let gender = req.body.gender;
    let qual = req.body.qualification;
    let address = req.body.address;
    let exp = req.body.experience;
    let check_mobile = "select * from instructor where mobile_no = '" + mobile + "' ";
    connection.query(check_mobile, (error, row) => {
        if (error) {
            res.send(error.message);
        } else {
            if (row.length > 0) {
                res.send("Mobile number already exists");
            } else {
                let insertInstructor = "INSERT INTO instructor VALUES" +
                    "(null,'" + instname + "', '" + instemail + "', '" + instpassword + "','" + mobile + "','" + gender + "','" + qual + "','" + address + "','" + exp + "','active')";
                // console.log(insertInstructor);
                connection.query(insertInstructor, (error) => {
                    if (error) {
                        res.send(error.message);
                        // console.log(error.message)
                    } else {
                        res.send("instructor added successfully...");
                        //console.log("admin added successfully...");
                    }
                })
            }
        }
    })
})

app.post('/instructor-login', (req, res) => {
    let instname = req.body.inst_name;
    let ipassword = req.body.password;
    let validateInstructor = "SELECT * FROM instructor WHERE inst_name='" + instname + "' AND password='" + ipassword + "'";
    // console.log(validateInstructor);
    connection.query(validateInstructor, (error, row) => {
        if (error) {
            res.send(error.message)
        } else {
            // console.log(row.length)
            if (row.length == 0) {
                res.send("Invalid Instructor name and password")
            } else {
                req.session.instructor_data = instname
                res.send("Success")
            }
        }
    })

    //req.session.destroy((err) => {
    //res.redirect('/admin-login.html')
    // })
})

app.get('/view-instructors', (req, res) => {
    let viewInst = "select * from instructor";
    connection.query(viewInst, (error, rows) => {
        if (error) {
            res.send(error.message)
        } else {
            res.send(rows)
        }
    })
})

app.get("/delete-instructor/:id", (req, res) => {
    let id = req.params.id;
    let deleteInst = "UPDATE instructor SET status='left' WHERE id ='" + id + "'";
    console.log(deleteInst);
    connection.query(deleteInst, (error) => {
        if (error) {
            res.send(error.message);
        } else {
            res.send("Instructor deleted");
        }
    })
})
app.post("/update-inst-record/:id", (req, res) => {

    console.log(req.body);
    let id = req.params.id;

    let uiname = req.body.inst_name;
    let uiemail = req.body.email;
    let uimobile = req.body.mobile_no;
    let uigender = req.body.gender;
    let uiqual = req.body.qualification;
    let uiaddress = req.body.address;
    let uiexp = req.body.experience;

    let updateInst = "UPDATE instructor SET inst_name ='" + uiname + "', email='" + uiemail + "', mobile_no='" + uimobile + "',gender='" + uigender + "',qualification='" + uiqual + "',address='" + uiaddress + "',experience='" + uiexp + "' WHERE id=" + id;
    console.log(updateInst);
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

app.post('/add-question', (req, res) => {
   // console.log(req.body);
    let qid = req.params.qid;
    let question = req.body.question;
    let option_a = req.body.option_a;
    let option_b = req.body.option_b;
    let option_c = req.body.option_c;
    let option_d = req.body.option_d;
    let correct_ans = req.body.correct_answer;


    let checkquestion = "select * from questions where question='" + question + "'";
    connection.query(checkquestion, (error, row) => {
        if (error) {
            res.send(error.message);
        } else {
            if (row.length > 0) {
                res.send("question already exists");
            } else {
                let insertQuestion = "INSERT INTO questions VALUES" +
                    "(null,'" + question + "', '" + option_a + "', '" + option_b + "','" + option_c + "','" + option_d + "','" + correct_ans + "')";
                //console.log(insertQuestion);
                connection.query(insertQuestion, (error) => {
                    if (error) {
                        res.send(error.message);
                    } else {
                        res.send("question added successfully...");
                    }
                })
            }
        }
    })
})

app.get('/view-questions', (req, res) => {
    let viewQuestion = "SELECT * FROM questions";
    connection.query(viewQuestion, (error, rows) => {
        if (error) {
            res.send(error.message)
        }
        // console.log(rows);
        res.send(rows)

    })
})

app.post("/update-ques/:qid", (req, res) => {
    console.log("----- Update route-----"+req.body);
    let qid = req.params.qid;
    let uquestion = req.body.question;
    let uoption_a = req.body.option_a;
    let uoption_b = req.body.option_b;
    let uoption_c = req.body.option_c;
    let uoption_d = req.body.option_d;
    let ucorrect_answer = req.body.correct_answer;

    /*let updateQuestion = "UPDATE questions SET  question='" + uquestion + "', option_a='" + uoption_a + "', option_b='" + uoption_b + "',option_c='" + uoption_c + "',option_d='" + uoption_d + "',correct_answer='" + ucorrect_answer + "' WHERE qid=" + qid + "";
    console.log(updateQuestion);
    connection.query(updateQuestion, (error) => {
        if (error) {
            res.send(error.message);
            // console.log(error.message);
        } else {
            // console.log("Data Updated");
            res.send("Question Updated successfully");
        }
    })*/
})
app.get('/delete-question/:qid', (req, res) => {
    let qid = req.params.qid;
    let deleteQuestion = "DELETE FROM questions WHERE qid=" + qid + "";
    connection.query(deleteQuestion, (error) => {
        if (error) {
            res.send(error.message)
        } else {
            res.send("1 Question Deleted...")

        }
    })
})

app.post('/add-student', (req, res) => {
   console.log(req.body);
    let email= req.body.email;
    let check_email = "select * from students where email='" + email + "'";
    connection.query(check_email, (error, row) => {
        if (error) {
            res.send(error.message);
        } else {
            if (row.length > 0) {
                res.send("email  already exists");
            } else {
                let photo = req.files.photo;
                let serverPath = "images/user" + photo.name;
                photo.mv(serverPath, (error) => {
                    if (error) {
                        console.log(error.message)
                    } else{
                        let phone = req.body.phone;
                        let photoPathDB = "images/user/" + photo.name;
                        let fullname = req.body.fullname;
                        let gender = req.body.gender;
                        let course = req.body.course;
                        let password = req.body.password;

                        let insertStudent = "INSERT INTO students VALUES" +
                            "('" + email + "', '" + password + "', '" + fullname + "','" + gender + "','" + photoPathDB+ "','" + course + "','" + phone + "')";
                        // console.log(insertStudent);
                        connection.query(insertStudent, (error) => {
                            if (error) {
                                res.send(error.message);
                                // console.log(error.message)
                            } else {
                                res.send("student added successfully...");
                            }
                        });
                    }
                });
            }
        }
    })
})

app.post('/student-login',(req,res) => {
    let email = req.body.email;
    let password = req.body.password;
    let validateStudent = "SELECT * FROM students WHERE email ='" + email + "' AND password ='" + password + "'";
    connection.query(validateStudent,(error,row) => {
        if(error) {
            res.send(error.message)
        }
        else {
            // console.log(row.length);
            if(row.length == 0) {
                res.send("Invalid email and password.")
            } else {
                req.session.student_data = email;
                res.send("Success")
            }
        }
    })
})

app.listen(port, () => {
    console.log("Server connected")
})


