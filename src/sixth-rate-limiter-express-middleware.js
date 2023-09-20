import axios from 'axios';
import listEndpoints from 'express-list-endpoints';
import { get_time_now } from './six_utils.js';



function getDate() {
  let _now = Date;
  return {
    seconds: _now.now()
  }
}

const rateLimitMiddleWare = (_apikey, _app, _config, route, _log_dict) => {

  console.log(`hey there ${_apikey}`);

  const _is_rate_limit_reached=async(_config,uid, route)=>{
    var date = getDate().seconds
    var timestamp = getDate().seconds


    const rate_limit = _config.rate_limiter[route].rate_limit
    const interval = _config.rate_limiter[route].interval

    const body={
      "route":route,
      "interval":interval,
      "rate_limit":rate_limit,
      "unique_id":uid.replace(".","~"),
      "user_id":_config.user_id,
      "is_active":true
    }
    const response=await axios.post("https://backend.withsix.co/rate-limit/enquire-has-reached-rate_limit",body)
    if(response.status==200){
      const bod=response.data;
      return bod["response"]==true?true:false;
    }else{
      return false
    }

  }

  const _send_logs=async(apiKey,_log_dict,route,header,body,query)=>{

    const timestamp=get_time_now();
    const last_log_sent=_log_dict[route]
    if(timestamp-last_log_sent>10000||last_log_sent==null){
      
      const response=await axios.post("https://backend.withsix.co/slack/send_message_to_slack_user",
      {header:header,user_id:apiKey,body:JSON.stringify(body),
      query_args:JSON.stringify(query),timestamp:timestamp,attack_type:"No Rate Limit Attack", 
      cwe_link:"https://cwe.mitre.org/data/definitions/770.html", 
      status:"MITIGATED",
      learn_more_link:"https://en.wikipedia.org/wiki/Rate_limiting",
      route:route});
      _log_dict[route]=timestamp;
    }
  };

  return async (req, res, next) => {
    
    // Middleware logic
    const host = req.headers.host
    var status_code=200
    var route = req.originalUrl
    route = route.replace(/\//g, "~")
    var body=null

    

    //fail safe in case the sixth server is down
    try{
      const updatedTime=get_time_now();
      console.log(`hey there ${updatedTime},${_config.rate_limiter[route].last_updated}`);
      
      if (updatedTime - _config.rate_limiter[route].last_updated>60000){
      const response= await axios.get("https://backend.withsix.co/project-config/config/get-route-rate-limit/"+_apikey+"/"+route)
      if (response.statusText=="OK"){
        status_code=response.status
        _config.rate_limiter[route].last_updated=updatedTime
        if(status_code==200){
          try{
            if(response.data.is_active){
              _config.rate_limiter[route] = response.data 
              let preferred_id=_config.rate_limiter[route].unique_id
              if(preferred_id==""||preferred_id=="host"){
                preferred_id=host
              }else{
                if(response.data.rate_limit_type=="body"){
                  try{
                    preferred_id=req.body[preferred_id]
                  }catch(err){
                    next()
                  }
                }
                  
                else if(response.data.rate_limit_type=="header"){
                  preferred_id=req.headers[preferred_id]
                }
                else if (response.data.rate_limit_type=="args"){
                  preferred_id=req.query[preferred_id]
                }
                else{
                  preferred_id=host
                }
              }
              const result=await _is_rate_limit_reached(_config,preferred_id,route)
              if (result){
                
                await _send_logs(_apikey,_log_dict,route,req.headers,req.body,req.query)
                const temp_payload=Object.values(response.data.error_payload);
                const final={}
                for(const value of temp_payload){
                  for(const key of Object.keys(value)){
                    if(key!="uid"){
                      final[key]=value[key]
                    }
                  }
                }
                const stringed=JSON.stringify(final)
                const newHeader={"content_length":Buffer.from(toString(stringed.length)),"content-type": "application/json"}
                res.set(newHeader);
                res.status(420).send(final);
              }else{
                next()
              }
            }else{
              next()
            }
          }catch(err){
            next()
          }
        }
      }else{
        next();
      }
    
      }else{
        next();
      }
    }catch(err){
      console.log(err);
      next()
    }
  };
};

export default rateLimitMiddleWare;