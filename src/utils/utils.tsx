import { useMemo } from 'react';
import { emailRegex } from './regex';
import { ToastMessage } from '@/data/interface-data';
import { toast } from 'react-toastify';
import Dashboard from '@/components/dashboard/dashboard';
import Projects from '@/components/dashboard/Projects/projects';
import Activity from '@/components/dashboard/Activity/activity';
import Users from '@/components/dashboard/Users/users';
export const validateEmail = (value: string): boolean => emailRegex.test(value);
export const useEmailValidation = (value: string): boolean =>
  useMemo(() => {
    if (value === '') return true;
    return validateEmail(value);
  }, [value]);
  export const showToastMessage = ({type,message, position = "top-right"}:ToastMessage) => {
    if(type==='success'){
    toast.success(message, {
      position: "top-right",
    });
  }
  if(type==='error'){
    toast.error(message, {
      position: "top-right",
    });
  }
  if(type==='warning'){
    toast.warning(message, {
      position:"top-right",
    });
  }
  if(type==='info'){
    toast.info(message, {
      position:"top-right",
    });
  }
  };
  export const tabUtil = (tab:string,user:string) => {
    if(tab==='Dashboard'){
      return <Dashboard role={user}/>
    }
    else if(tab==='Projects'){
      return <Projects role={user}/>
    }
    else if(tab==='Activity'){
      return <Activity  role={user}/>;
    }
    else if(tab==='Users'){
      return <Users role={user}/>;
    }
    else if(tab==='Workers'){
      return <>Welcome to Workers Page</>;
    }
    else if(tab==='Customers'){
      return <>Welcome to Customers Page</>;
    }
    else if(tab==='Manager'){
      return <>Welcome to Manager Page</>;
    }
    else if(tab==='Services'){
      return <>Welcome to Services Page</>;
    }
    else if(tab==='Admins'){
      return <>Welcome to Admins Page</>;
    }
  }