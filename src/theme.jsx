import {createContext,useContext,useEffect,useState} from 'react'
const KEY='sa-theme',C=createContext()
export const useTheme=()=>useContext(C)
const initial=()=>{try{const t=localStorage.getItem(KEY);if(t)return t}catch{}return matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}
export function ThemeProvider({children}){
  const [theme,setTheme]=useState(initial)
  useEffect(()=>{document.documentElement.dataset.theme=theme;try{localStorage.setItem(KEY,theme)}catch{}},[theme])
  return <C.Provider value={{theme,toggle:()=>setTheme(t=>t==='dark'?'light':'dark')}}>{children}</C.Provider>
}
