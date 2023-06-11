import crypto from 'crypto';
import _ from 'lodash';

function parseBools(encodedString){
    var decodeString=atob(encodedString);
    decodeString=decodeString.replace(/ /g, "");
    decodeString=decodeString.replace('true,', "True,");
    decodeString=decodeString.replace(",true", "True,");
    decodeString=decodeString.replace('false,', "False,");
    decodeString=decodeString.replace(",false", "False,")
    //out=ast.literal_eval(string)
    return decodeString;

};

function encryptWithRSA(data,publicKey) {
    const encrypted = crypto.publicEncrypt({
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING
    }, Buffer.from(data, 'utf8'));
  
    return encrypted.toString('base64');
  }

  function decryptWithRSA(encryptedData,privateKey){
    const decrypted = crypto.privateDecrypt({
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    }, Buffer.from(encryptedData, 'base64'));
  
    return decrypted.toString('utf8');
  }


  function parseWords(word){
    const added_word=":::bob_::_johan::sixer";
    const index = word.indexOf(added_word);
    const add = word.slice(index);
    const real = word.replace(add,"");

    if(add.includes("int")){
        return parseInt(real)
    }

    if(add.includes("float")){
        return parseFloat(real)
    }

    if(add.includes("str")){
        const converted= real
        return converted.toString();
    }

    if(add.includes("bool")){
        return !!real
    }
    
  }

  export function postOrderEncrypt(publicKey,key,data,copyText,listKey=null){
    if (Array.isArray(data)){
        const newList=[];
        data.forEach((element)=>{
            if(typeof element==="object"){
                const newDeepCopy = _.cloneDeep(element);
                postOrderEncrypt(publicKey,null,element,newDeepCopy);
                newList.push(newDeepCopy);
            }else{
                newList.push(encryptWithRSA(publicKey,element.toString()+":::bob_::_johan::sixer"+typeof element));
            }
        })

        if(Array.isArray(copyText)){
            copyText.splice(0,copyText.length);
            copyText.push(...newList)
            return
        }

        if(typeof copyText==="object"){
            delete copyText[listKey];
            copyText[listKey]=newList;
        }
    }

    if(typeof data!=="object"){
        copyText[encryptWithRSA(publicKey,key)]=encryptWithRSA(publicKey,data.toString+":::bob_::_johan::sixer"+typeof data)
    }

    if(typeof data==="object"){
        for(const key in data){
            const encrypted=encryptWithRSA(publicKey,key)
            copyText[encrypted]=copyText.pop(key)
            if(typeof copyText[encrypted] !=="object" && !Array.isArray(copyText)){
                copyText[encrypted] = encryptWithRSA(publicKey, copyText[encrypted].toString()+":::bob_::_johan::sixer"+typeof copyText[encrypted])
            } else if(Array.isArray(copyText)){
                postOrderEncrypt(publicKey,key,data[key],copyText,encrypted)
            } else{
                postOrderEncrypt(publicKey,key,data[key],copyText[encrypted])
            }
        }
    }

  }


  export function postOrderDecrypt(privateKey,key,data,copyText,listKey=null){
    if (Array.isArray(data)){
        const newList=[];
        data.forEach((element)=>{
            if(typeof element==="object"){
                const newDeepCopy = _.cloneDeep(element);
                postOrderDecrypt(privateKey,null,element,newDeepCopy);
                newList.push(newDeepCopy);
            }else{
                newList.push(decryptWithRSA(privateKey,element.toString()+":::bob_::_johan::sixer"+typeof element));
            }
        })

        if(Array.isArray(copyText)){
            copyText.splice(0,copyText.length);
            copyText.push(...newList)
            return
        }

        if(typeof copyText==="object"){
            delete copyText[listKey];
            copyText[listKey]=newList;
        }
    }

    if(typeof data!=="object"){
        copyText[decryptWithRSA(privateKey,key)]=decryptWithRSA(privateKey,data.toString+":::bob_::_johan::sixer"+typeof data)
    }

    if(typeof data==="object"){
        for(const key in data){
            const encrypted=decryptWithRSA(privateKey,key)
            copyText[encrypted]=copyText.pop(key)
            if(typeof copyText[encrypted] !=="object" && !Array.isArray(copyText)){
                copyText[encrypted] = decryptWithRSA(privateKey, copyText[encrypted].toString()+":::bob_::_johan::sixer"+typeof copyText[encrypted])
            } else if(Array.isArray(copyText)){
                postOrderDecrypt(privateKey,key,data[key],copyText,encrypted)
            } else{
                postOrderDecrypt(privateKey,key,data[key],copyText[encrypted])
            }
        }
    }

  }

const moment = require('moment-timezone');

function get_time_now() {
  const tz = moment.tz('Africa/Lagos');
  const today = moment().tz(tz);
  return today.unix();
}

function get_todays_start() {
  const tz = moment.tz('Africa/Lagos');
  const today = moment().tz(tz).startOf('day');
  return today.unix();
}

function get_day_from_now(days) {
  const tz = moment.tz('Africa/Lagos');
  const today = moment().tz(tz).startOf('day').add(days, 'days');
  return today.unix();
}

function get_min_offset_from_now(min) {
  const now = get_time_now();
  const delta = min * 60;
  const targetTime = now + delta;
  const offset = targetTime - now;
  return offset;
}

function get_offset_from_nine_am() {
  const now = get_time_now();
  const startOfDay = get_todays_start();
  const delta = 9 * 60 * 60;
  const nineAM = startOfDay + delta;
  const offset = nineAM - now;
  return offset;
}

function get_offset_from_twleve_fiteen() {
  const now = get_time_now();
  const startOfDay = get_todays_start();
  const delta = 12 * 60 * 60 + 57 * 60;
  const twelveFifteen = startOfDay + delta;
  const offset = twelveFifteen - now;
  return offset;
}

function get_offset_from_six_pm() {
  const now = get_time_now();
  const startOfDay = get_todays_start();
  const delta = 18 * 60 * 60;
  const sixPM = startOfDay + delta;
  const offset = sixPM - now;
  return offset;
}

function get_next_nine_am_day() {
  const nextDate = get_day_from_now(1);
  return nextDate + 9 * 60 * 60;
}

function get_readable_date_from_time_stamp(ts) {
  return moment.unix(ts).format('YYYY-MM-DD');
}

function get_day_from_time_stamp(timeStamp) {
  const time = moment.unix(timeStamp);
  const day = time.format('dddd');
  return day;
}

function get_a_week_time(timestamp) {
  return timestamp + 7 * 24 * 60 * 60;
}
