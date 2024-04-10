import { useMemo } from 'react';
import { emailRegex } from './regex';
import { ToastMessage } from '@/data/interface-data';
import { toast } from 'react-toastify';
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