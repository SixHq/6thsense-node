import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

export function parseWords(word){
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
