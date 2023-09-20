import axios from "axios";
import { response } from "express";
import listEndpoints from "express-list-endpoints";
import { encryptionMiddleWare } from "./sixth-encryption-express-middleware.js";
import rateLimitMiddleWare from "./sixth-rate-limiter-express-middleware.js";
import  express  from "express";
import { get_time_now } from "./six_utils.js";



class SixthSense{
    constructor(apikey, app) {
        this._apikey = apikey;
        this._app = app;
        this._base_url = "https://backend.withsix.co"
        this._config = null
        this._config_resp = ""
        this._log_dict = {}
    }

    async init() {
        const _project_config_resp = await axios.get(this._base_url+"/project-config/config/"+this._apikey);
        this._config = _project_config_resp.data
        this._config_resp = _project_config_resp.statusText
        if (this._config.encryption_enabled){
            this._app.use(encryptionMiddleWare)
        }
        if(this._config.rate_limiter_enabled){
            this._app.use(rateLimitMiddleWare(this._apikey, this._app, this._config, listEndpoints(this._app), this._log_dict))
        }
        
    }

    async sync_project(){
        this._sync_project_route(this._config)
        const routes = listEndpoints(this._app)
        routes.forEach(route=>{
            const edited_route = route.path.replace(/\//g, "~");
            
            this._log_dict[edited_route] = null;
        })
    }

    async _sync_project_route(config = null){
        const routes = listEndpoints(this._app);
        const _rl_configs = {};
        routes.forEach(route=>{
            const edited_route = route.path.replace(/\//g, "~");
            if (config !== null && Object.keys(config.rate_limiter).includes(edited_route)){
                _rl_configs[edited_route] = config.rate_limiter[edited_route];
            }else{
                _rl_configs[edited_route] = {
                    id: edited_route, 
                    route: edited_route, 
                    interval: 10, 
                    rate_limit: 1, 
                    last_updated:Date.now(), 
                    created_at: Date.now(), 
                    unique_id: "host",
                    is_active:false
                }
            }
        })
        const _config = {
            user_id : this._apikey, 
            rate_limiter: _rl_configs, 
            encryption: {
                public_key : "_", 
                private_key: "_",
                use_count: 0, 
                last_updated: 0, 
                created_at: 0
            }, 
            base_url: "_", 
            last_updated: Date.now(), 
            created_at: Date.now(), 
            encryption_enabled: config!==null && config.encryption_enabled? true : false, 
            rate_limiter_enabled: config!==null && config.rate_limiter_enabled? true : false
        }
        const sync_url = this._base_url+"/project-config/config/sync-user-config"
        const _project_config_resp = await axios.post(sync_url, _config)
        if( _project_config_resp.statusText === "OK"){
            return _config
        }else{
            return _config
        }
        
    }
      
}

export default SixthSense;