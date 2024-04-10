export interface authenticationProps {
    isAuthenticated?: boolean;
  }
  export interface adminLogin{
    redirect:() => void;
    url:string
  }

  export interface ToastMessage{
    type:string;
    message:string;
    position?:string;
  }
  export interface TopbarProps{
    username:string,
  }