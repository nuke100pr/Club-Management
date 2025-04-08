"use client";
import noteContext from "./noteContext";
import { useState } from "react";


const NoteState = (props) =>{

   const [info , setInfo]= useState({});

   const update = (value) =>{
    setInfo(value);
   };
   
   return (
    <noteContext.Provider value={{info,update}}>
        {props.children}
    </noteContext.Provider>
   )
}

export default NoteState;