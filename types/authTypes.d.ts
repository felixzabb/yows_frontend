type SignInData = {
  email: string
  password: string
};

type SignUpData = {
  email: string
  passwordConfirm: string
  password: string
  alias: string
};

type UserSessionData = {
  id: string
  email: string
  image: string
  alias: string
};

type SessionUserData = {
  user? : {
      id : string
      email : string
      image : string
      alias : string
  }
};
