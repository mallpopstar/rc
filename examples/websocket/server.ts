// deno run --allow-net server.ts
Deno.serve(req => {
  if (req.headers.get('upgrade') !== 'websocket') {
    return new Response(null, { status: 501 })
  }
  
  const { socket, response } = Deno.upgradeWebSocket(req)
  socket.addEventListener('open', () => {
    console.log('a client connected!')
    socket.send(JSON.stringify({ type: 'subscribe', selector: 'form', event: 'submit' }))
  })

  socket.addEventListener('message', event => {
    const payload = JSON.parse(event.data)
    console.log(payload)
    if(payload.body.selector === 'form' && payload.body.type === 'submit') {
      console.log('unsubscribing from form')
      socket.send(JSON.stringify({ type: 'unsubscribe', selector: 'form', event: 'submit' }))
    }
  })
  return response
})
