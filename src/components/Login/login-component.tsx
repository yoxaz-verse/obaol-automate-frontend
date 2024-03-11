import { adminLogin } from '@/data/interface-data';
import { Button, Input } from '@nextui-org/react'
import Image from 'next/image'
import React from 'react'
import { BiLogInCircle } from 'react-icons/bi';
import { FiLogIn } from "react-icons/fi";
const LoginComponent = ({redirect}:adminLogin) => {
  return (
    <div className='shadow-2xl p-4 flex flex-col justify-evenly items-center w-[425px] h-[450px]'>
        <div>
          <div className='flex justify-center text-xl text-[#788BA5]'><BiLogInCircle/></div>
        <div className='text-2xl py-2 font-bold text-center'>Login with your work email</div>
        <div className='text-sm py-2 text-[#788BA5]'>Use your work email to log in to your team workspace.</div>
        </div>
        <div className='w-11/12'>
        <Input type="email" label="Email" placeholder="Enter your email" className='py-3' color="primary"/>
        <Input type="password" label="Password" placeholder="Enter your password" color="primary"/>
        <div className='text-center text-[#117DF9] mt-2'>Forgot Password?</div>
        </div>
        <Button className='bg-[#624DE3] text-white w-[90%] mt-6 flex justify-center p-2 rounded' onClick={redirect}>Log In</Button>
    </div>
  )
}

export default LoginComponent