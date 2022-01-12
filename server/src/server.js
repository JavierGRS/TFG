const admin = require('./config/firebase-config')
const express = require('express')
const bodyParser = require('body-parser');
const db = admin.firestore()
const app = express();
const port = 5000;
const cors = require('cors');

app.use(bodyParser.json());
app.use(express.urlencoded());



const middleware = require('./middleware');

app.use(cors());

// app.use(middleware.decodeToken);

app.listen(port, () => {
    console.log('server is running on port ' + port)
})


// ************** USERS ****************

app.get('/api/rol/userID/:userID', async (req, res) => {

    try {
        db.collection('users')
            .where("id", "==", req.params.userID)
            .get()
            .then(querySnapshot => {
                if (!querySnapshot.empty) {
                    let role = querySnapshot.docs[0].data().role
                    return res.status(200).send(role)
                }
            })

    } catch (e) {
        res.status(500).send({ error: error.message });
    }
})

//get a single contact
app.get('/api/users/:userId', (req, res) => {


    const userId = req.params.userId;

    admin.auth().getUser(userId).then((u) => {
        const user = {
            id: userId,
            email: u.email,
        }
        console.log("Acceso al usuario " + user.email)
        return res.status(200).send(JSON.stringify(user))

    }).catch(error => {
        console.log("Usuario no encontrado")
        res.status(500).send({ error: error.message });
    })

});

// Delete a user
app.delete('/api/users/:userId', (req, res) => {


    const userId = req.params.userId;
    try {
        admin.auth()
            .deleteUser(userId)
            .then(() => {
                console.log('Successfully deleted user');
                return res.status(204).send('Successfully deleted user')
            })
    } catch (error) {
        console.log('Error deleting user:', error);
        return res.status(404).send('Error deleting user:', error)

    }
});

//get all users
app.get('/api/users', async (req, res) => {

    console.log("Acceso a todos los usuarios")

    try {
        const query = db.collection('users');
        const querySnapshot = await query.get();

        const docs = querySnapshot.docs;

        const response = docs.map(doc => ({
            id: doc.data().uid,
            email: doc.data().email,
            role: doc.data().role,
        }))

        console.log("Acceso a todos los usuarios")
        return res.send(JSON.stringify(response))

    } catch (error) {
        return res.send("ERROR")
    }
})


// ********* TICKETS ******************

//get all worker tickets with state acepted
// Worker is at dashboard and wants too see all tickets he's accepeted or done
// Worker wants to see all tickets with state "aceptar" or "finalizado" and type "limpieza"
http://localhost:5000/api/tickets/workerID/jzHNOmnt2NbiFAAFesfILqEnWs63?type=limpieza&state=aceptado
app.get('/api/tickets/workerID/:workerID', async (req, res) => {


    try {

        var query = db.collection('tickets')

        if (req.query.type) {

            query = query.where("type", "==", req.query.type)

        }

        if (req.query.state) {

            query = query.where("state", "==", req.query.state)

        }

        const querySnapshot = await query.get();

        const docs = querySnapshot.docs;

        const response = docs.map(doc => doc.data())

        return res.send(JSON.stringify(response))

    } catch (error) {
        return res.send(error)
    }
})

// ADMIN is at dashboard and wants too see all tickets accepeted or done
app.get('/api/tickets/adminID/:adminID', async (req, res) => {


    try {
        console.log(req.params.adminID)
        if (!(await db.collection('admin').where("id", "==", req.params.adminID).get()).empty) {
            console.log("admin checked correctly")
        } else {
            return res.status.apply(401).json({ error: "Not authorized" })
        }

        var query = db.collection('tickets')

        if (req.query.type) {

            query = query.where("type", "==", req.query.type)

        }

        if (req.query.state) {

            query = query.where("state", "==", req.query.state)

        }

        const querySnapshot = await query.get();

        const docs = querySnapshot.docs;

        const response = docs.map(doc => ({
            ...doc.data(),
            ticketID: doc.id
        }))

        console.log(response)

        return res.send(JSON.stringify(response))

    } catch (error) {
        return res.send(error)
    }
})


//Si es el rol inquilino:
//Ver todos los tickets asignados a él que sean de solicitud
//Ver todos los tickets asignados a él que sean aceptados. Al pinchar en un ticket a parte de los datos del ticket tambien le salen los datos del trabajador.
app.get('/api/tickets', async (req, res) => {
    try {
        var query = db.collection("tickets")

        if (req.query.state) {
            query = query.where("state", "==", req.query.state)
        }

        if (req.query.type) {
            query = query.where("type", "==", req.query.type)
        }

    } catch (e) {
        return res.status(500).json({ error: e })
    }
})

//get all worker tickets with state acepted
// Worker is at dashboard and wants too see all tickets he's accepeted or done
// Worker wants to see all tickets with state "aceptar" or "finalizado" and type "limpieza"
http://localhost:5000/api/tickets/state/aceptado/type/limpieza/workerID/jzHNOmnt2NbiFAAFesfILqEnWs63
app.get('/api/tickets/state/:state/type/:type/workerID/:workerID', async (req, res) => {

    try {
        const query = db.collection('tickets')
            .where("state", "==", req.params.state)
            .where("type", "==", req.params.type)
            .where("worker", "==", req.params.workerID)

        const querySnapshot = await query.get();

        // const response = querySnapshot.docs[0].data();

        const response = querySnapshot.docs.map(doc => doc.data())

        return res.send(JSON.stringify(response))

    } catch (error) {
        return res.send(error)
    }
})





//get all tickets with state
// Example: teneant wants to see all tickets he's created with state "solicitar"
http://localhost:5000/api/tickets/state/solicitar/tenantID/CPNDFv5mzwfCKnyj4dvTBdq5FLz1
app.get('/api/tickets/tenantID/:tenantID', async (req, res) => {

    try {

        const query = db.collection('tickets')
            .where("state", "==", req.query.state)
            .where("tenantID", "==", req.params.tenantID)

        const querySnapshot = await query.get();

        const docs = querySnapshot.docs;

        const response = docs.map(doc => ({
            ...doc.data(),
            ticketID: doc.id
        }))

        return res.status(200).json(response)

    } catch (e) {
        return res.status(500).send({ error: e })
    }
})


//create new ticket with apartament, state and type
// Example: teaneant creates a request ticket to clean the apartament 
http://localhost:5000/api/tickets/tenantID/CPNDFv5mzwfCKnyj4dvTBdq5FLz1/apartmentID/AUTIcH0MtHM4ViZ5wu39/state/solicitar/type/limpieza
app.post('/api/tickets/tenantID/:tenantID/apartmentID/:apartmentID/state/:state/type/:type', async (req, res) => {

    try {

        //IF USER IS TENANT THEN tenant: req.params.userID
        //IF USER IS ADMIN THEN search the actual tenant who's in the apartment
        //and put it automatically

        const newTicket = {
            apartmentID: req.params.apartmentID,
            createdBy: req.params.tenantID,
            state: req.params.state,
            type: req.params.type,
            tenant: req.params.tenantID
        }

        db.collection('tickets').add(newTicket);

        return res.status(201).send('Ticket added correctly' + "\n" + JSON.stringify(newTicket))


    } catch (error) {
        return res.send("ERROR")
    }
})

//ADMIN CREATES NEW TICKET 
http://localhost:5000/api/tickets/adminID/jzHNOmnt2NbiFAAFesfILqEnWs63/
app.post('/api/tickets/adminID/:adminID/', async (req, res) => {


    //IF USER IS TENANT THEN tenant: req.params.userID
    //IF USER IS ADMIN THEN search the actual tenant who's in the apartment
    //and put it automatically

    //Check if admin is correct
    if (db.collection('admin').where("id", "==", req.params.adminID)) {
        console.log("admin checked correctly")
    } else {
        return res.status.apply(401).json({ error: "Not authorized" })
    }

    var queryTeanant = db.collection('tenants')
        .where("apartmentID", "==", req.body.apartmentID)
        .where("state", "==", "active")


    const querySnapshot = await queryTeanant.get();
    var tenant = ""

    if (querySnapshot.empty) {
        console.log("NO TEANANT active in the APARTMENT")
    } else {
        console.log("TEANANT is active in the APARTMENT")
        const docs = querySnapshot.docs;
        console.log(docs)
        tenant = docs[0].data().userID;
    }

    var newTicket = {
        ...req.body,
        tenantID: tenant
    }



    db.collection('tickets').add(newTicket).
        then(function (docRef) {
            newTicket = {
                ...newTicket,
                ticketID: docRef.id
            }
            console.log("Ticket added correctyly: ")
            console.log(newTicket)

        })



    return res.status(201).send('Ticket added correctly' + "\n" + JSON.stringify(newTicket))

})



// UPDATE ticket from state "solicitar" to "aceptar"
// Example: worker "cleaner" accepts a ticket
http://localhost:5000/api/tickets/ticketId/kVSy9FMC3CDDhdnbgx2n/worker/jzHNOmnt2NbiFAAFesfILqEnWs63/stateAfter/aceptado
app.put('/api/tickets/ticketId/:ticketId/worker/:worker/stateAfter/:stateAfter', async (req, res) => {

    try {

        const newTicket = {
            worker: req.params.worker,
            state: req.params.stateAfter
        }

        db.collection('tickets').doc(req.params.ticketId).update(newTicket)

        return res.status(201).send("Ticket updated correctly" + "\n" + JSON.stringify(newTicket))

    } catch (error) {
        return res.status(500).send("ERROR UPDATING TICKET")
    }
})






// ********** APARTAMENTS ************

//get all apartments
app.get('/api/apartments', async (req, res) => {
    // console.log(req.headers.authorization)
    try {
        const query = db.collection('apartaments');
        const querySnapshot = await query.get();

        const docs = querySnapshot.docs;

        const response = docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            block: doc.data().block,
            number: doc.data().number

        }))

        console.log("Acceso a todos los apartamentos")
        return res.send(JSON.stringify(response))

    } catch (error) {
        console.log("Invalid authentication")
        return res.send(error.code).status(401)
    }

})




// ********** Workers ************

//get workers list with type or name
app.get('/api/workers/', async (req, res) => {

    try {
        var query = db.collection('workers');

        if (req.query.type) {
            query = query.where("type", "==", req.query.type)
            console.log("Acceso workers tipo " + req.query.type)
        }

        if (req.query.name) {
            query = query.where("type", "==", req.query.name)
        }

        const querySnapshot = await query.get();

        const docs = querySnapshot.docs;

        const response = docs.map(doc => ({
            id: doc.data().id,
            name: doc.data().name,
            type: doc.data().type
        }))

        return res.send(JSON.stringify(response))

    } catch (error) {
        return res.send("ERROR")
    }

})



//get a specific worker
http://localhost:5000/api/workers/eVGJsl2GiOZZGAbH66M6Sd6gEfH3
app.get('/api/workers/:workerID', async (req, res) => {


    try {
        const query = db.collection('workers').where("id", "==", req.params.workerID);

        const querySnapshot = await query.get();

        const docs = querySnapshot.docs;

        const response = docs.map(doc => ({
            idUser: doc.data().id,
            name: doc.data().name,
            type: doc.data().type
        }))


        return res.send(JSON.stringify(response))

    } catch (error) {
        return res.send("ERROR")
    }

})


// ********** SIGNUP ************

app.post('/api/signUp/userID/:userID', async (req, res) => {

    try {
        const user = {
            id: req.params.userID,
            role: "tenant"
        }



        db.collection('users').add(user)
        console.log("User registered succesfully: " + JSON.stringify(user))

        return res.status(200).send(JSON.stringify(user))

    } catch (e) {
        return res.status(500).json({ error: e })
    }


})










