import {createApi,fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import { logout, setCredentials } from '../../features/auth/authSlilce'






const baseQuery=fetchBaseQuery({
    baseUrl:'http://localhost:5000/api/v1/auth',
    credentials:'include',
    prepareHeaders:(headers,{getState})=>{
        const token=getState().auth?.token
        if(token){
            headers.set("authorization",`Bearer ${token}`)
        }
        return headers
    }
})

const baseQueryWithReauth=async(args,api,extraOptions)=>{
   let result =await baseQuery(args,api,extraOptions)
   console.log('the result in the base query',result, );

   
//    if(result?.error?.originalStatus===403){

   if(result?.error?.status===403){
    console.log('Sending refresh token');
    //send refresh token to get new access token
    const refreshResult=await baseQuery('/refresh',api,extraOptions)
    console.log(refreshResult)
    if(refreshResult?.data){
    const user=api.getState().auth.user
    //store the token
    api.dispatch(setCredentials({...refreshResult.data,user}))
    //retry the original query with new access token
    result=await baseQuery(args,api,extraOptions)
    }else{
        api.dispatch(logout())
    }
   }
   return result
}

export const apiSlice=createApi({
    baseQuery:baseQueryWithReauth,
    endpoints:builder=>({})
})
