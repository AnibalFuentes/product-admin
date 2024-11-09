"use client"

export const setInLocalstorage=(key:string,value:unknown)=>{
    return localStorage.setItem(key,JSON.stringify(value));

}