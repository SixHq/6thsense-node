import express from 'express'
import {v4 as uuid4} from 'uuid'

const router = express.Router()

const users = [
    {
        firstName: "Opeyemi", 
        lastName: "Adewole", 
        age: 25
    }
]

router.get("/", (req, res)=>{
    res.send( users );
})

router.post("/", (req, res)=>{
    res.send( {
        ope: 'ope',
        ope1: 'ope',
        ope2: 'ope',
        ope3: 'ope',
        ope4: 'ope',
        ope5: 'ope',
        ope6: 'ope',
        ope7: 'ope',
        ope8: 'ope',
        ope9: 'ope',
        opeq: 'ope',
        opew: 'ope',
        opee: 'ope',
        oper: 'ope'
      } );
})

router.get("/:id", (req, res)=>{
    res.send(
        `id is ${req.params["id"]}`
    )
})

router.delete("/:id", (req, res)=>{
     
})

export default router