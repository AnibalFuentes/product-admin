"use client"

export const getFromLocalstorage=(key:string)=>{
    return JSON.parse(localStorage.getItem(key) as string); 

}