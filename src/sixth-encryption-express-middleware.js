import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import _ from 'lodash';
import { postOrderDecrypt, postOrderEncrypt } from './utils';


async function getTextFileFromFirebaseStorage(fileUrl,apiKey){
    try {
      const response = await axios.post(fileUrl,{params:{apiKey}});
      return response.data;
    } catch (error) {
      console.error('Error retrieving text file:', error);
      throw error;
    }
  }


export function encryptionMiddleWare(req=Request,res=Response,next=NextFunction){
    const apiKey=req.headers.apiKey;
    const output= _.cloneDeep(req.body);
    const resOutput= _.cloneDeep(res.body);
    getTextFileFromFirebaseStorage("private_key_url",apiKey).then((response)=>response.private_key.text().then((result)=>{
      postOrderDecrypt(result,null,req.body,output)
    }));
    getTextFileFromFirebaseStorage("public_key_url",apiKey).then((response)=>response.public_key.text().then((result)=>{
      postOrderEncrypt(result,null,res.body,resOutput)
    }));

}