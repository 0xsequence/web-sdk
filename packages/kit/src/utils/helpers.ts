export const isEmailValid = (email: string) => {
  return /^\S+@\S+\.\S{2,}$/.test(email)
}
