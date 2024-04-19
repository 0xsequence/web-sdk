export const isEmailValid = (email: string) => {
  return /^\S+@\S+\.\S{2,}$/.test(email)
}

export const compareAddress = (a: string, b: string) => {
  return a.toLowerCase() === b.toLowerCase()
}
