const bcrypt = require('bcryptjs');

module.exports = {

    register: async (req, res) => {
        // bring in our db
        const db = req.app.get('db');

        // receive info to add new user
        const { name, email, password, admin } = req.body;

        // check if email is already registered, if so reject
        try {
            const [existingUser] = await db.get_user_by_email(email)

            if (existingUser) {
                return res.status(409).send('User already exists')
            };
            // hash and salt password
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);

            // add user to db and get back their id
            const [newUser] = await db.register_user(name, email, hash, admin);

            // create session for the user using the db response 
            req.session.user = newUser;

            // send response to frontend, includes user session info
            res.status(200).send(newUser);

        } catch (error) {
            console.log(error)
            return res.sendStatus(500)
        }


    },

    login: (req, res) => {
        // get db instance 
        const db = req.app.get('db');

        // get necessary info from req.body sent by user
        const { email, password } = req.body;

        // check if that user exist, if NOT reject request
        db.get_user_by_email(email)
            .then(([existingUser]) => {
                if (!existingUser) {
                    return res.status(403).send('Incorrect email')
                }

                // compare the password from req.body to stored hash in db, if mismatched reject 
                const isAuthenticated = bcrypt.compareSync(password, existingUser.hash)

                if (!isAuthenticated) {
                    return res.status(403).send('Incorrect password')
                }
                //set up our session and be sure to not include the hash in the session

                delete existingUser.hash; //removes hash from req.session.user being sent to front
                req.session.user = existingUser;

                // send the response and session to the front end
                res.status(200).send(req.session.user);

            })

    },

    logout: (req, res) => {
        req.session.destroy();
        res.sendStatus(200);
    }
}