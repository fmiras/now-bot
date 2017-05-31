import {exec} from 'child-process-promise'

export default async (sArguments) => {
  const result = await exec(`now ${sArguments}`)
  return result
}
