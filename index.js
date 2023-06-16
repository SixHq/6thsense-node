import  express  from "express";
import bodyParser from 'body-parser'
import router from "./routes/user.js";
import SixthSense from "./src/sixth_sense.js";


const app = express();
const PORT = 5000;


app.use(bodyParser.json())

const six = new SixthSense("YVawS7tr1SaBmeG4NVZt3OniEw52", app)
await six.init()
app.use("/users", router) 


app.get("/", (req, res)=>{
    res.send(
        {
            "health": true
        }
    )
})

six.sync_project();
app.listen(PORT, ()=> console.log(`Server running on port: http://localhost:${PORT}`))