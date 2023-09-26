import crypto from 'crypto';
import _ from 'lodash';
import moment from 'moment-timezone';
import {v4 as uuid4} from 'uuid'

const aesjs = require('aes-everywhere');

function parseBools(encodedString){
    var decodeString=atob(encodedString);
    decodeString=decodeString.replace(/ /g, "");
    decodeString=decodeString.replace('true,', "true,");
    decodeString=decodeString.replace(",true", "true,");
    decodeString=decodeString.replace('false,', "false,");
    decodeString=decodeString.replace(",false", "false,")
    //out=ast.literal_eval(string)
    return decodeString;

};

export function get_time_now() {
  const tz ='Africa/Lagos';
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

export function postOrderEncrypt(payload){
  const newSecretKey=uuid4().substring(0,16);
  const secretKeyPartOne= newSecretKey.substring(0,4);
  const secretKeyPartTwo= newSecretKey.substring(4,8);
  const secretKeyPartThree= newSecretKey.substring(8,12);
  const secretKeyPartFour= newSecretKey.substring(12,16);
  var encryptedData = aesjs.encrypt(newSecretKey, payload);
  const positions=[4,8,12,16];
  const keys=[secretKeyPartOne,secretKeyPartTwo,secretKeyPartThree,secretKeyPartFour];
  let counter=0;
  for(const position of positions){
    if (position >= 0 && position <= encryptedData.length) {
      encryptedData= encryptedData.slice(0, position) + keys[counter] + encryptedData.slice(position);
    }
    counter=counter+1;
  }
  return encryptedData;

}


export function postOrderDecrypt(encryptedPayload){
  const positions=[16,12,8,4];
  var secretKey="";
  const secretKeyParts=[];
  var newEncryptedPayload=encryptedPayload;
  for(const position of positions){
    secretKeyParts.push(newEncryptedPayload.substring(position,position+4));
    newEncryptedPayload=newEncryptedPayload.slice(0,position)+newEncryptedPayload.slice(position+4,newEncryptedPayload.length)
  }
  secretKeyParts.reverse();
  for (const part of secretKeyParts){
    secretKey=secretKey+part;
  }
  const decryptedPayload=aesjs.decrypt(secretKey,newEncryptedPayload);
  return decryptedPayload;
}
