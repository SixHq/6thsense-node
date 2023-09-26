
import axios from 'axios';
import _ from 'lodash';
import { postOrderEncrypt, postOrderDecrypt, get_time_now } from './six_utils.js';





export function encryptionMiddleWare(apiKey,config,_log_dict){

  const _send_logs=async(apiKey,_log_dict,route,header,body,query)=>{

    const timestamp=get_time_now();
    const last_log_sent=_log_dict[route]
    if(timestamp-last_log_sent>10000||last_log_sent==null){
      
      const response=await axios.post("https://backend.withsix.co/slack/send_message_to_slack_user",
      {header:header,user_id:apiKey,body:JSON.stringify(body),
      query_args:JSON.stringify(query),timestamp:timestamp,attack_type:"Encryption Bypass", 
      cwe_link:"https://cwe.mitre.org/data/definitions/311.html", 
      status:"MITIGATED",
      learn_more_link:"https://en.wikipedia.org/wiki/Rate_limiting",
      route:route});
      _log_dict[route]=timestamp;
    }
  };

  const _update_encryption_details=async()=>{
    const timestamp=get_time_now();
    if(timestamp-config.encryption.last_updated<10){
      return
    };
    const response = await axios.get(`https://backend.withsix.co/encryption-service/get-encryption-setting-for-user?user_id=${apiKey}`);
    if(response.status==200){
      config.encryption.last_updated=timestamp;
      return response.data.enabled;
      
    }else{
      return false;
    }
  };


  
  return async (req,res,next)=>{
    var route = req.originalUrl;
    route = route.replace(/\//g, "~");
    config.encryption_enabled=await _update_encryption_details();
    if(config.encryption_enabled){
      try{
        decryptedRequest=postOrderDecrypt(req.body.data);
        req.body=decryptedRequest;
        next();
      }catch(err){
        await _send_logs(apiKey,_log_dict,route,req.headers,req.body,req.query)
        const output= {
          "data": "UnAuthorized"
      }
      const stringed=JSON.stringify(output)
      const newHeader={"content_length":Buffer.from(toString(stringed.length)),"content-type": "application/json"}
      res.set(newHeader);
      res.status(420).send(output);
      }
      try{
        const originalSend = res.send;
        res.send = function (body) {
          const output={
            "data":postOrderEncrypt(body)
          }
          stringed=output;
          originalSend.call(this,output);
        };
        next();
      }catch(err){
        const output= {
          "data": "UnAuthorized"
      }
      const stringed=JSON.stringify(output)
      const newHeader={"content_length":Buffer.from(toString(stringed.length)),"content-type": "application/json"}
      res.set(newHeader);
      res.status(420).send(output);
      }
    }
  };
};