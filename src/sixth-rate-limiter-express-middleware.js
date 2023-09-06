import axios from 'axios';
import listEndpoints from 'express-list-endpoints';



function getDate() {
  let _now = Date;
  return {
    seconds: _now.now()
  }
}

const rateLimitMiddleWare = (_apikey, _app, _config, route, _log_dict) => {
  function _is_rate_limit_reached(uid, route){
    var date = getDate().seconds
    var timestamp = getDate().seconds
    var requests = null

    try{
      requests = _log_dict[route][uid]
    }catch{

    }


    const rate_limit = _config.rate_limiter[route].rate_limit
    const interval = _config.rate_limiter[route].interval

    if (requests == null){
       requests = []
       _log_dict[route][uid] = []
    }

    if (requests.length < rate_limit){
      _log_dict[route][uid].push(timestamp)
      return true
    }
    const new_req = _log_dict[route][uid].filter((news => 
      news>timestamp-(interval*1000)
    )) 
    if (new_req.length<rate_limit){
      _log_dict[route][uid].push(timestamp)
      return true
    }
    else{ 
        _log_dict[route][uid].push(timestamp)
        return false
    }
  }

  return (req, res, next) => {
    // Middleware logic
    const host = req.headers.host
    var route = req.originalUrl
    route = route.replace(/\//g, "~")
    //fail safe in case the sixth server is down
    try{
      axios.get("https://backend.withsix.co/project-config/config/get-route-rate-limit/"+_apikey+"/"+route).then(response=>{
      if (response.statusText=="OK"){
        _config.rate_limiter[route] = response.data
        const preferred_id = _config.rate_limiter[route].unique_id == "" || _config.rate_limiter[route].unique_id == "host"? host : _config.rate_limiter[route].unique_id 
        if (_is_rate_limit_reached(preferred_id, route)){
          next()
        }
        else{
          const old_json = res.json;
          res.json = old_json
          res.status(401)
          return old_json.call(res,  {
            "message": "max request reached"
          });
        }
      }
    })
    }catch(err){
      next()
    }
  };
};

export default rateLimitMiddleWare;