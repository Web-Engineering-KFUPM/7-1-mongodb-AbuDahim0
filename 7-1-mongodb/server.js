/**
 * ================================================================================================================
   Back-end Lab — MongoDB
 * ================================================================================================================
 *
 * ================================================================================================================
 *                                                    MongoDB Cloud
 * ================================================================================================================
 * 
 * =======================================================
 * TODO-1: SignUp and create cluster  
 * =======================================================
 * - 1.1: SignUp on mongoDB cloud at https://cloud.mongodb.com/
 * - 1.2: create project and click on Build Cluster
 *   Note: Take a single screen shot of the Todo 1.3 to 1.7 and save it in Mongo-Screen-shots/TODO-1
 * - 1.3: choose free plan to create cluster
 * - 1.4: Name the cluster cluster0
 * - 1.5: choose AWS as provider
 * - 1.6: choose region Bahrain
 * - 1.7: click on the button "create deployment"
 *
 *================================================================
 * TODO-2: Setup username and password to create a database user
 * ===============================================================
 *   - 2.1:  write any username to create a database user.
 *   - 2.2: write any password.
 *    Note: Take a single screen shot of the Todo 2.1 & 2.2 before presing create database user button and save it in      Mongo-Screen-shots/TODO-2
 *   - 2.3: click on the button to create a database user
 * 
 * ============================================
 * TODO-3 Allow access to the network
 * ============================================
 *   - 3.1:  choose database & network access from the security option.
 *   - 3.2: choose IP access list from the left menu.
 *   - 3.3: edit IP address and set 0.0.0.0/0 and confirm it.
 *   Note: Take a screen shot of TODO 3.3 and save it in Mongo-Screen-shots/TODO-3
 *
 * ============================================
 * TODO-4 Download and setup Monogsh (Do it if you dont have mongosh, otherwise skip this step)
 * ============================================
*    - 4.1: go to clusters and click on connect button.
*    - 4.2: choose shell as the connection option.
*    - 4.3: click on the I don't have mongoDB shell installed. 
 *   - 4.4: choose windows or MacOS as operating system and install mongosh.(Take screent shot and save it in Mongo-Screen-shots/TODO-4)
 *   - 4.5: After installation setup the environment variable path.(Take screent shot and save it in Mongo-Screen-shots/TODO-4)
 *   - 4.6: copy the connection string
 *   - 4.7: open cmd and paste the connection string to establish connection with mongoDB cloud. (Take screent shot and save it in Mongo-Screen-shots/TODO-4)
 *
 * ============================================
 * TODO-5 Create DB & Collection
 * ============================================
 *   - In cmd write the following commands: 
 *      - 5.1:  use labDB          // create or switch DB
 *      - 5.2: db.createCollection("students") //// create collection
 *   Note: Take a single screen shot of the Todo 5.1 & 5.2 and save it in Mongo-Screen-shots/TODO-5
 * ============================================
 * TODO-6 Insert Documents
 * ============================================
 *   - 6.1: In cmd write the following commands: 
 *      - db.students.insertMany([
            { name: "Ali", age: 21, major: "CS" },
            { name: "Sara", age: 23, major: "SE" } ])
 *    Note: Take a single screen shot of the Todo 6.1 and save it in Mongo-Screen-shots/TODO-6
 * ============================================
 * TODO-7 Read Documents
 * ============================================
 *   - In cmd write the following commands: 
 *      - 7.1:  db.students.find()               // all
 *      - 7.2: db.students.find({ age: { $gt: 21 } })  // filtered
 *   Note: Take a single screen shot of the Todo 7.1 & 7.2 and save it in Mongo-Screen-shots/TODO-7
 * ============================================
 * TODO-8 Update & Delete
 * ============================================
 *   - In cmd write the following commands: 
 *      - 8.1:  db.students.updateOne({ name: "Ali" }, { $set: { age: 22 } }) 
 *      - 8.2: db.students.deleteOne({ name: "Sara" })
 *    Note: Take a single screen shot of the Todo 8.1 & 8.2 and save it in Mongo-Screen-shots/TODO-8
 * ============================================
 * TODO-9 Quick Check
 * ============================================
 *   - In cmd write the following commands: 
 *      - 9.1: db.students.find().pretty()
 *      - 9.2: Should show only Ali, age = 22.
 *    Note: Take a single screen shot of the Todo 9.1 & 9.2 and save it in Mongo-Screen-shots/TODO-9
 * ================================================================================================================
 *                                                    Mongoose
 * ================================================================================================================
 * ===================================================================
    LAB SETUP INSTRUCTIONS
   ===================================================================

   1. Navigate to the project directory:
      Open your terminal and run:
         cd 7-1-mongodb

   2. Install project dependencies:
      Run either of these commands:
         npm i
         OR
         npm install
         npm install mongoose

   If your system blocks running npm commands (especially on Windows PowerShell),
      run this command first to allow script execution:
         Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

 * =====================================================
 * TODO-1 Estbalish Connection with MongoDB via Mongoose
 * =====================================================
 *  - import mongoose
 *    - import mongoose from "mongoose";
 *  - Go to cluster click on connect and select MongoDB for VS code
 *  - Copy the connection string.
 *       Example connection string:
 *       -  Correct Format: mongodb+srv://HasanDB:<db_password>@cluster0.rygtjue.mongodb.net/TestDB
 *       -  Incorrect Format: mongodb+srv://HasanDB:<db_password>@cluster0.rygtjue.mongodb.net
 *  - write your database username in place of HasanDB in the connection string.
 *  - write your database password in place of <db_password> in the connection string.
 *  - Run server: node server.js to test connection.
 * 
 * =====================================================
 * TODO-2 Define the schema of the DB
 * ===================================================== 
 *    const studentSchema = new mongoose.Schema({
         name: String,
         age: Number,
         major: String
      });
      const Student = mongoose.model("Student", studentSchema);
      - Run server: node server.js and go to mongo cloud to see DB schema in test->students.
 * 
 * =====================================================
 * TODO-3 Create Document
 * ===================================================== 
 *  - This code will create document in database.
 * async function createStudents() {
      await Student.insertMany([
         { name: "Ali", age: 21, major: "CS" },
         { name: "Sara", age: 23, major: "SE" }
      ]);
      console.log("✅ Inserted");
      }
      createStudents();
   - Run server: node server.js and go to mongo cloud to see created document.
 * =====================================================
 * TODO-4 Read Documents
 * ===================================================== 
 * - This code will read all the document in database.
 *  
 *    async function readStudents() {
         const all = await Student.find();
         console.log(all);
      }
      readStudents();
    - Run server: node server.js.
 * =====================================================
 * TODO-5 Update Document
 * ===================================================== 
 * - This code will update a document in database.
 *  
 *    async function updateStudent() {
         await Student.updateOne({ name: "Ali" }, { age: 22 });
         console.log("✅ Updated Ali");
      }
      updateStudent();
 * - Run server: node server.js and got to mongo cloud to see the updated document.
 * =====================================================
 * TODO-6 Delete Document
 * ===================================================== 
 * - This code will delete a document in database.
 *  
 *    async function deleteStudent() {
         await Student.deleteOne({ name: "Sara" });
      console.log("✅ Deleted Sara");
      }
      deleteStudent();
 * - Run server: node server.js and got to mongo cloud to verify, document is deleted.
 * 
 * Note on Collection Naming in Node.js (Mongoose)
 * When a collection is created in Node.js using Mongoose, the name is automatically converted to lowercase and plural form.
 *  Examples:
 *    Student → students
 *    User → users
 *  This is the default behavior of Mongoose.
 */

// import mongoose

// establish connection


// define schema


// create document


// read document


// update document


// delete document
