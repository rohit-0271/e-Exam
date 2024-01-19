-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 25, 2023 at 08:56 AM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 7.4.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `node_online_examination`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_table`
--

CREATE TABLE `admin_table` (
  `username` varchar(80) NOT NULL,
  `password` varchar(25) DEFAULT NULL,
  `fullname` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `usertype` varchar(30) DEFAULT NULL,
  `statusl` varchar(30) DEFAULT 'Active',
  `otp` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `admin_table`
--

INSERT INTO `admin_table` (`username`, `password`, `fullname`, `email`, `usertype`, `statusl`, `otp`) VALUES
('admin', '123', 'John Doe', 'subhratosingh@gmail.com', 'Super Admin', 'active', NULL),
('navpreet', '123', 'Navreet Kaur', 'navpreet@gmail.com', 'Admin', 'active', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `assign_subject_question_to_exam`
--

CREATE TABLE `assign_subject_question_to_exam` (
  `id` int(11) NOT NULL,
  `questions` text NOT NULL,
  `examSubjectID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `assign_subject_question_to_exam`
--

INSERT INTO `assign_subject_question_to_exam` (`id`, `questions`, `examSubjectID`) VALUES
(5, '5,8,4', 14);

-- --------------------------------------------------------

--
-- Table structure for table `assign_subject_to_exam`
--

CREATE TABLE `assign_subject_to_exam` (
  `id` int(11) NOT NULL,
  `examID` int(11) NOT NULL,
  `subjectID` int(11) NOT NULL,
  `total_number_of_questions` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `assign_subject_to_exam`
--

INSERT INTO `assign_subject_to_exam` (`id`, `examID`, `subjectID`, `total_number_of_questions`) VALUES
(14, 2, 8, 3),
(16, 2, 9, 10);

-- --------------------------------------------------------

--
-- Table structure for table `course`
--

CREATE TABLE `course` (
  `courseID` int(11) NOT NULL,
  `courseName` varchar(100) NOT NULL,
  `courseLogo` text NOT NULL,
  `courseDescription` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `course`
--

INSERT INTO `course` (`courseID`, `courseName`, `courseLogo`, `courseDescription`) VALUES
(3, 'Programming', 'courseLogo/programming.png', 'Programming refers to the process of creating sets of instructions or code that a computer can follow to perform specific tasks.'),
(4, 'Data Structure', 'courseLogo/ds.png', 'A data structure is a way of organizing, storing, and managing data in a computer so that it can be efficiently used and manipulated.'),
(5, 'DBMS', 'courseLogo/dbms.png', 'A Database Management System (DBMS) is software that facilitates the creation, organization, storage, retrieval, modification, and management of data in a database.'),
(6, 'Web Development', 'courseLogo/web.png', 'Web development refers to the process of creating, building, and maintaining websites and web applications.');

-- --------------------------------------------------------

--
-- Table structure for table `exam`
--

CREATE TABLE `exam` (
  `examID` int(11) NOT NULL,
  `examCode` varchar(20) NOT NULL,
  `examName` varchar(100) NOT NULL,
  `instructions` text NOT NULL,
  `date` date NOT NULL,
  `total_time_in_minutes` int(11) NOT NULL,
  `instructorID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `exam`
--

INSERT INTO `exam` (`examID`, `examCode`, `examName`, `instructions`, `date`, `total_time_in_minutes`, `instructorID`) VALUES
(2, 'EXAM080923', 'Final Exam Summer 1 2023', 'Please read the instructions carefully.', '2023-09-16', 60, 15),
(4, 'EXAM090923', 'Final Exam Summer 2 2023', 'Please read the instructions carefully.', '2023-09-16', 90, 16);

-- --------------------------------------------------------

--
-- Table structure for table `exam_result`
--

CREATE TABLE `exam_result` (
  `resultID` int(11) NOT NULL,
  `examSubjectID` int(11) NOT NULL,
  `studentID` int(11) NOT NULL,
  `totalScore` float NOT NULL,
  `obtainedScore` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `exam_result`
--

INSERT INTO `exam_result` (`resultID`, `examSubjectID`, `studentID`, `totalScore`, `obtainedScore`) VALUES
(12, 14, 8, 4, 0);

-- --------------------------------------------------------

--
-- Table structure for table `instructor`
--

CREATE TABLE `instructor` (
  `id` int(11) NOT NULL,
  `firstName` varchar(100) DEFAULT NULL,
  `lastName` varchar(100) NOT NULL,
  `profilePhoto` text NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `password` varchar(45) DEFAULT NULL,
  `mobile` varchar(12) DEFAULT NULL,
  `gender` varchar(45) DEFAULT NULL,
  `qualification` varchar(45) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `experience` varchar(45) DEFAULT NULL,
  `subjects` varchar(100) NOT NULL,
  `status` varchar(45) DEFAULT 'Active',
  `otp` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `instructor`
--

INSERT INTO `instructor` (`id`, `firstName`, `lastName`, `profilePhoto`, `email`, `password`, `mobile`, `gender`, `qualification`, `address`, `experience`, `subjects`, `status`, `otp`) VALUES
(15, 'Subhrato', 'Singh', 'instructors/male-avatar.png', 'subhratosingh@gmail.com', '123', '8198850602', 'Male', 'Post-Graduation', 'H No. 909/X/17, Katra Mohar Singh\r\nNear Guru Bazar', '1-3 years', '8,9', 'Active', NULL),
(16, 'Suraj', 'Singh', 'instructors/male-avatar.png', 'subhratosingh15921@gmail.com', '123', '6280137073', 'Male', 'Post-Graduation', 'H No. 909/X/17, Katra Mohar Singh\r\nNear Guru Bazar', '1-3 years', '4', 'Active', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `email` varchar(155) NOT NULL,
  `password` varchar(30) DEFAULT NULL,
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `fatherName` varchar(100) NOT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `photo` text DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `address` text NOT NULL,
  `status` varchar(15) NOT NULL DEFAULT 'Active',
  `otp` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `email`, `password`, `firstName`, `lastName`, `fatherName`, `gender`, `photo`, `phone`, `address`, `status`, `otp`) VALUES
(8, 'subhratosingh@gmail.com', '999', 'subhrato', 'Singh', 'Tapas Singh', 'Male', 'students/male-avatar.png', '8198850602', 'H No. 909/X/17, Katra Mohar Singh, Near Guru Bazar, Amritsar', 'Active', NULL),
(9, 'subhratosingh15921@gmail.com', '123', 'Sara', 'Doe', 'Josh', 'Male', 'students/female-avatar.png', '1234567890', 'Mall Road, Amritsar', 'Active', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `student_subjects`
--

CREATE TABLE `student_subjects` (
  `id` int(11) NOT NULL,
  `studentID` int(11) NOT NULL,
  `subjectID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `student_subjects`
--

INSERT INTO `student_subjects` (`id`, `studentID`, `subjectID`) VALUES
(12, 8, 8),
(13, 8, 9),
(14, 8, 4),
(15, 9, 7),
(16, 9, 2),
(17, 9, 8);

-- --------------------------------------------------------

--
-- Table structure for table `subject`
--

CREATE TABLE `subject` (
  `sID` int(11) NOT NULL,
  `sCode` varchar(20) NOT NULL,
  `sName` varchar(100) NOT NULL,
  `sLogo` text NOT NULL,
  `sDescription` text NOT NULL,
  `courseID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `subject`
--

INSERT INTO `subject` (`sID`, `sCode`, `sName`, `sLogo`, `sDescription`, `courseID`) VALUES
(2, 'SUB100', 'Programming in C', 'subjectLogo/c.png', 'C is a general-purpose programming language that was originally developed in the early 1970s by Dennis Ritchie at Bell Labs.', 3),
(3, 'SUB101', 'Data Structure in Java', 'subjectLogo/java.jpg', 'Java is a popular high-level programming language known for its versatility, portability, and robustness.', 4),
(4, 'SUB102', 'MySQL', 'subjectLogo/mysql.png', 'MySQL is an open-source relational database management system (RDBMS) that is widely used for managing and organizing structured data.', 5),
(5, 'SUB103', 'Programming in C++', 'subjectLogo/c++.png', 'C++ is a versatile and powerful programming language that builds upon the features of the C programming language.', 3),
(7, 'SUB104', 'MongoDB', 'subjectLogo/mongoDB.png', 'MongoDB is a popular open-source, document-oriented NoSQL (non-relational) database management system.', 5),
(8, 'SUB1005', 'HTML', 'subjectLogo/html.png', 'HTML (Hypertext Markup Language) is the standard markup language used to structure and present content on the World Wide Web.', 6),
(9, 'SUB1006', 'JavaScript', 'subjectLogo/js.png', 'JavaScript is a versatile and widely used programming language that enables interactivity, dynamic behavior, and functionality in web development.', 6);

-- --------------------------------------------------------

--
-- Table structure for table `subject_questions`
--

CREATE TABLE `subject_questions` (
  `qid` int(11) NOT NULL,
  `question` text NOT NULL,
  `option_a` text NOT NULL,
  `option_b` text NOT NULL,
  `option_c` text NOT NULL,
  `option_d` text NOT NULL,
  `correct_answer` varchar(20) NOT NULL,
  `marks` float NOT NULL,
  `subjectID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `subject_questions`
--

INSERT INTO `subject_questions` (`qid`, `question`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_answer`, `marks`, `subjectID`) VALUES
(4, 'What does the abbreviation HTML stand for?', 'HyperText Markup Language.', 'HighText Markup Language.', 'HyperText Markdown Language.', 'None of the above.', 'A', 1.5, 8),
(5, 'How many sizes of headers are available in HTML by default?', '5', '1', '3', '6', 'D', 1, 8),
(6, 'What is the smallest header in HTML by default?', 'h1', 'h2', 'h6', 'h4', 'C', 2, 8),
(8, 'We enclose HTML tags within?', '{}', '<>', '!!', 'None of the above.', 'B', 1.5, 8),
(9, 'Javascript is an _______ language?', 'Object-Oriented', 'Object-Based', 'Procedural', 'None of the above.', 'A', 1, 9),
(10, 'Which of the following keywords is used to define a variable in Javascript?', 'var', 'let', 'Both A and B', 'None of the above.', 'C', 1, 9),
(11, 'Which of the following methods is used to access HTML elements using Javascript?', 'getElementbyId()', 'getElementsByClassName()', 'Both A and B', 'None of the above', 'C', 1, 9);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_table`
--
ALTER TABLE `admin_table`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `assign_subject_question_to_exam`
--
ALTER TABLE `assign_subject_question_to_exam`
  ADD PRIMARY KEY (`id`),
  ADD KEY `examSubjectID` (`examSubjectID`);

--
-- Indexes for table `assign_subject_to_exam`
--
ALTER TABLE `assign_subject_to_exam`
  ADD PRIMARY KEY (`id`),
  ADD KEY `examID` (`examID`),
  ADD KEY `subjectID` (`subjectID`);

--
-- Indexes for table `course`
--
ALTER TABLE `course`
  ADD PRIMARY KEY (`courseID`);

--
-- Indexes for table `exam`
--
ALTER TABLE `exam`
  ADD PRIMARY KEY (`examID`),
  ADD KEY `teacherID` (`instructorID`);

--
-- Indexes for table `exam_result`
--
ALTER TABLE `exam_result`
  ADD PRIMARY KEY (`resultID`),
  ADD KEY `examSubjectID` (`examSubjectID`),
  ADD KEY `studentID` (`studentID`);

--
-- Indexes for table `instructor`
--
ALTER TABLE `instructor`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `student_subjects`
--
ALTER TABLE `student_subjects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `studentID` (`studentID`),
  ADD KEY `subjectID` (`subjectID`);

--
-- Indexes for table `subject`
--
ALTER TABLE `subject`
  ADD PRIMARY KEY (`sID`),
  ADD KEY `subject_ibfk_1` (`courseID`);

--
-- Indexes for table `subject_questions`
--
ALTER TABLE `subject_questions`
  ADD PRIMARY KEY (`qid`),
  ADD KEY `subjectID` (`subjectID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `assign_subject_question_to_exam`
--
ALTER TABLE `assign_subject_question_to_exam`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `assign_subject_to_exam`
--
ALTER TABLE `assign_subject_to_exam`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `course`
--
ALTER TABLE `course`
  MODIFY `courseID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `exam`
--
ALTER TABLE `exam`
  MODIFY `examID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `exam_result`
--
ALTER TABLE `exam_result`
  MODIFY `resultID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `instructor`
--
ALTER TABLE `instructor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `student_subjects`
--
ALTER TABLE `student_subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `subject`
--
ALTER TABLE `subject`
  MODIFY `sID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `subject_questions`
--
ALTER TABLE `subject_questions`
  MODIFY `qid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assign_subject_question_to_exam`
--
ALTER TABLE `assign_subject_question_to_exam`
  ADD CONSTRAINT `assign_subject_question_to_exam_ibfk_1` FOREIGN KEY (`examSubjectID`) REFERENCES `assign_subject_to_exam` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `assign_subject_to_exam`
--
ALTER TABLE `assign_subject_to_exam`
  ADD CONSTRAINT `assign_subject_to_exam_ibfk_1` FOREIGN KEY (`examID`) REFERENCES `exam` (`examID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `assign_subject_to_exam_ibfk_2` FOREIGN KEY (`subjectID`) REFERENCES `subject` (`sID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `exam`
--
ALTER TABLE `exam`
  ADD CONSTRAINT `exam_ibfk_1` FOREIGN KEY (`instructorID`) REFERENCES `instructor` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `exam_result`
--
ALTER TABLE `exam_result`
  ADD CONSTRAINT `exam_result_ibfk_1` FOREIGN KEY (`examSubjectID`) REFERENCES `assign_subject_to_exam` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `exam_result_ibfk_2` FOREIGN KEY (`studentID`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `student_subjects`
--
ALTER TABLE `student_subjects`
  ADD CONSTRAINT `student_subjects_ibfk_1` FOREIGN KEY (`studentID`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `student_subjects_ibfk_2` FOREIGN KEY (`subjectID`) REFERENCES `subject` (`sID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `subject`
--
ALTER TABLE `subject`
  ADD CONSTRAINT `subject_ibfk_1` FOREIGN KEY (`courseID`) REFERENCES `course` (`courseID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `subject_questions`
--
ALTER TABLE `subject_questions`
  ADD CONSTRAINT `subject_questions_ibfk_1` FOREIGN KEY (`subjectID`) REFERENCES `subject` (`sID`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
