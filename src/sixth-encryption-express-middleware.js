
import axios from 'axios';
import _ from 'lodash';
import { postOrderEncrypt, postOrderDecrypt } from './six_utils.js';


async function getTextFileFromFirebaseStorage(fileUrl,apiKey){
  if (fileUrl === "private_key_url"){
    try {
      const response = await axios.post("https://backend.withsix.co/encryption-service/get-user-private_key",{'apiKey':apiKey});
     
      const txt = await axios.get(response.data.data.private_key);
      return txt.data;
    } catch (error) {
      throw error;
    }
  }else {
    try {
      const response = await axios.post("https://backend.withsix.co/encryption-service/get-user-public-key",{'apiKey':apiKey});
      const txt = await axios.get(response.data.data.public_key);
      return txt.data;
    } catch (error) {
      throw error;
    }
  }
}


export function encryptionMiddleWare(req=Request,res=Response,next=NextFunction){
    const apiKey=req.headers.apikey;
    
    const output= _.cloneDeep(req.body);
    getTextFileFromFirebaseStorage("private_key_url",apiKey).then((response)=>
      {
        
        postOrderDecrypt(response,null,req.body,output)
        req.body = output
        //next();
        const old_json = res.json;
        res.json = (data) =>{
          if (data && data.then != undefined) {
            return data.then((responseData) => {
                res.json = old_json;
                getTextFileFromFirebaseStorage("public_key_url", apiKey).then((response)=>{
                  const resOutput= _.cloneDeep(responseData);
                  postOrderEncrypt(response,null, responseData,resOutput)
                  return old_json.call(res, resOutput);
                })
            }).catch((error) => {
                next(error);
            });
        } else {
            res.json = old_json;
            getTextFileFromFirebaseStorage("public_key_url", apiKey).then((response)=>{
              const resOutput= _.cloneDeep(data);
              postOrderEncrypt(response,null, data,resOutput)
              return old_json.call(res, resOutput);
            })
        }
        }
        next();
    }
    );
}