import express from "express";
import mysql from "mysql2";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url"; // Import fileURLToPath
const __dirname = path.dirname(fileURLToPath(import.meta.url)); // Define __dirname using fileURLToPath
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(cors({ origin: 'https://rukar.netlify.app/' }));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT || 2000;



const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});


db.connect( (error, result) => {
    if(error) 
    {
        console.log(`There is an error of database connection => ${error}...`);
    }
    else
    {
        console.log(`database Connected....`);
    }
    });
    
    app.post("/add_user", (req, res) => {
        // Check if the email already exists
    let checkEmailQuery = "SELECT * FROM student_details WHERE email =?";
    db.query(checkEmailQuery, [req.body.email], (error, results) => {
        if (error) {
            console.error(`There was an error checking the email in the route of /add_user in server.js file: ${error}`);
            res.status(500).json({
                error: "Internal server error"
            });
        } else if (results.length > 0) {
            // If email exists, respond with an error
            res.status(400).json({
                error: "Email already exists"
            });
        } else {
            // If email does not exist, proceed to insert the new student record
            let sqlquery = "INSERT INTO student_details(`name`, `email`, `age`, `gender`) VALUES (?, ?, ?, ?)";
            const values = [req.body.name, req.body.email, req.body.age, req.body.gen];

            db.query(sqlquery, values, (error, result) => {
                if (error) {
                    console.error(`There is an error of adding new values in the route of /add_user in server.js file: ${error}`);
                    res.status(500).json({
                        error: "Failed to add student"
                    });
                } else {
                    res.json({
                        success: "Student added successfully"
                    });
                    console.log("Data has been added successfully to the database from server.js file");
                }
            });
        }
    });
    });

    app.get('/students', (req, res) => {
        const sqlquery = "SELECT * FROM student_details ORDER BY id ASC";
        
        db.query(sqlquery, (error, result) => {
            if(error){
                console.error(`there is an error of retrieving data from database in the route of /students in server.js file ${error}`);
            }else{
                res.json({
                    result
                });
            }
        });
    });
    

    app.get('/students/:id', (req, res) => {
        const id = req.params.id;
        const sqlquery = "SELECT * FROM student_details WHERE `id` = ?";
        db.query(sqlquery, [id], (error, result) => {
            if(error){
                console.error(`there is an error of retrieving data from database in the route of /students/:id in server.js file ${error}`);
            }else{
                res.json(result[0]);
            }
        });
    });

    app.post('/edit_user/:id', (req, res) => {
        const id = req.params.id;
        const sqlquery = "UPDATE student_details SET `name` =?, `email` =?, `age` =?, `gender` =? WHERE id =?";
        const values = [req.body.name, req.body.email, req.body.age, req.body.gender, id];
        db.query(sqlquery, values, (error, result) => {
            if(error){
                console.error(`there is an error of updating data from database in the route of /edit_user/:id in server.js file ${error}`);
            }else{
                res.json(result[0]);
            }
        });
    });
    app.delete('/delete_user/:id', (req, res) => {
        const id = req.params.id;
        const sqlquery = "DELETE FROM student_details  WHERE id =?";
        
        db.query(sqlquery, [id], (error, result) => {
            if(error){
                console.error(`there is an error of updating data from database in the route of /edit_user/:id in server.js file ${error}`);
            }else{
                res.json(result[0]);
            }
        });
    });


app.listen(PORT, () => {
    console.log(`The server runs on port 2000...`);
});