import { Request, Response, NextFunction } from 'express';
import axios from 'axios';


function isRateLimitReached(){
    
}

export function rateLimitMiddleWare(req=Request,res=Response,next=NextFunction){
    const logDict={};
    const routes=[];
    const app=req.app;

    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
          const new_route = middleware.route.path.replace(/\W+/g, '~');
          routes.push(new_route);
          logDict[new_route]={};
        }
      });
}