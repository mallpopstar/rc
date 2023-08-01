// eslint-disable-next-line @typescript-eslint/no-unused-vars
const generatePathFromProxy = (_proxy: any): any => {
  const pathParts: string[] = []

  const handler: ProxyHandler<any> = {
    get(_0, propKey) {
      pathParts.push(propKey.toString())
      return new Proxy(() => void 0, handler)
    },
    apply(_0, _1, argArray) {
      const formattedArgs = argArray.map(arg => JSON.stringify(arg)).join(', ')
      const lastPart = pathParts[pathParts.length - 1]
      if (lastPart === 'toString') {
        return pathParts.slice(0, -1).join('.')
      }
      pathParts[pathParts.length - 1] = `${lastPart}(${formattedArgs})`
      return new Proxy(() => void 0, handler)
    },
    // Add a valueOf() method to return the string path when the proxy is coerced to a primitive value
    // valueOf() {
    //   return pathParts.join('.')
    // },
  }
  return new Proxy(() => void 0, handler)
}

export const query = (html: string) => {
  const hostProxy = new Proxy(() => void 0, {})
  const via = generatePathFromProxy(hostProxy)
  return via.$(html) as Document
}
