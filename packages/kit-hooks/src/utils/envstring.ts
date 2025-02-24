export const envString = (env: string, match: string, network: string) => {
  const prefix = env.slice(0, env.indexOf(match))
  const suffix = env.slice(env.indexOf(match))
  return `${prefix}${network}-${suffix}`
}
