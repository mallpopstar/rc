const { createReceiver, createSender, loadWorker } = partyline

const { createCookieReceiver } = remotecontrol
const { createCookieSender } = remotecontrol
const { createCookieStoreReceiver } = remotecontrol
const { createCookieStoreSender } = remotecontrol
const { createDocumentReceiver } = remotecontrol
const { createDocumentSender } = remotecontrol
const { createFetchReceiver } = remotecontrol
const { createFetchSender } = remotecontrol
const { createLocalStorageReceiver } = remotecontrol
const { createLocalStorageSender } = remotecontrol
const { createPageReceiver } = remotecontrol
const { createPageSender } = remotecontrol
const { createSessionStorageReceiver } = remotecontrol
const { createSessionStorageSender } = remotecontrol

const receiver = createReceiver()
const workerReceiver = createReceiver()
const sender = createSender()

function htmlToDOM(htmlString) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlString, 'text/html')
  return doc.body.firstChild
}

function connect() {
  const params = new URLSearchParams(window.location.search)
  const connType = params.get('connect')
  switch (connType) {
    case 'message':
      console.log('using MessageChannel')
      const messageChannel = new MessageChannel()
      receiver.connect(messageChannel.port1)
      sender.connect(messageChannel.port2)
      break
    case 'broadcast':
      console.log('using BroadcastChannel - open another window to connect')
      const broadcastChannel = new BroadcastChannel('rc')
      receiver.connect(broadcastChannel)
      sender.connect(broadcastChannel)
      break
    default:
      console.log('using window')
      receiver.connect(window)
      sender.connect(window)
  }
}

async function main() {
  console.log('remotecontrol demo')
  connect()

  // custom request handler
  receiver.onRequest('echo', (req, res) => {
    res.send('echo back --> ' + req.body)
  })

  runLocal()
  runFetch()
  runStorage()
  runDocument()
  runPage()
  runDocumentChange()
  // runWorker()
}

function runDocumentChange() {
  createDocumentReceiver(receiver).start()

  const documentSender = createDocumentSender(sender)
  documentSender.subscribe('[name="counter-input"]', 'mutate', val => {
    console.log('input mutated:', JSON.stringify(val, null, 2))
  })

  documentSender.subscribe('[name="counter"]', 'mutate', response => {
    const el = htmlToDOM(response.body)
    console.log('counter mutated:', el?.textContent)
  })
}

function runWorker() {
  const worker = loadWorker('http://localhost:8888/worker.js')
  workerReceiver.connect(worker)
  workerReceiver.onRequest('echo', (req, res) => {
    res.send('echo back --> ' + req.body)
  })
}

function runLocal() {
  // custom request
  sender.postRequest('echo', 'Hello, world!').then(r => console.log('echo', JSON.stringify(r, null, 2)))
}

function runStorage() {
  createCookieStoreReceiver(receiver).start()
  createCookieReceiver(receiver).start()
  createLocalStorageReceiver(receiver).start()
  createSessionStorageReceiver(receiver).start()

  const cookieStoreSender = createCookieStoreSender(sender)
  cookieStoreSender.subscribe('foo', r => console.log('foo changed:', JSON.stringify(r, null, 2)))
  cookieStoreSender.setItem('foo', 'bar')
  cookieStoreSender.getItem('foo').then(r => console.log('getItem', JSON.stringify(r, null, 2)))

  const localStorageSender = createLocalStorageSender(sender)
  localStorageSender.subscribe('foo', r => console.log('foo changed:', JSON.stringify(r, null, 2)))
  localStorageSender.setItem('foo', 'bar')
  localStorageSender.getItem('foo').then(r => console.log('getItem', JSON.stringify(r, null, 2)))

  const cookieSender = createCookieSender(sender)
  cookieSender.subscribe('foo', val => console.log('foo changed:', JSON.stringify(val, null, 2)))
  cookieSender.setItem('foo', 'bar')
  cookieSender.getItem('foo').then(r => console.log('getItem', JSON.stringify(r, null, 2)))

  const sessionStorageSender = createSessionStorageSender(sender)
  sessionStorageSender.subscribe('foo', val => console.log('foo changed:', val))
  sessionStorageSender.setItem('foo', 'bar')
  sessionStorageSender.getItem('foo').then(r => console.log('getItem', JSON.stringify(r, null, 2)))
}

function runFetch() {
  createFetchReceiver(receiver).start()

  const fetchSender = createFetchSender(sender)
  fetchSender.subscribe(r => console.log('fetched:', JSON.stringify(r, null, 2)))

  fetchSender.get('https://jsonplaceholder.typicode.com/todos/1', {}, { type: 'json' }).then(r => {
    // console.log('get', r.status, JSON.parse(r.body))
    console.log('get', JSON.stringify(r, null, 2))
  })
  fetchSender.post('https://jsonplaceholder.typicode.com/todos', {}, { type: 'json' }).then(r => {
    // console.log('post', r.status, JSON.parse(r.body))
    console.log('post', JSON.stringify(r, null, 2))
  })
  fetchSender.put('https://jsonplaceholder.typicode.com/todos/1', {}, { type: 'json' }).then(r => {
    // console.log('put', r.status, JSON.parse(r.body))
    console.log('put', JSON.stringify(r, null, 2))
  })
  fetchSender.delete('https://jsonplaceholder.typicode.com/todos/1', {}, { type: 'json' }).then(r => {
    // console.log('delete', JSON.parse(r.status))
    console.log('delete', r.status)
  })
}

function runDocument() {
  createDocumentReceiver(receiver).start()

  const documentSender = createDocumentSender(sender)
  documentSender.insertAdjacentHTML(
    'body',
    'beforeend',
    '<div name="button" class="good bad ugly" style="color:blue">This button was injected remotely</div>'
  )
  documentSender.querySelector('[name=button]').then(r => {
    console.log('querySelector', JSON.stringify(r, null, 2))
  })
  // documentSender.remove('[name=button]')
  documentSender.addStyles('[name=button]', { color: '#FF00FF', fontWeight: 'bold', borderColor: '#FF00FF' })
  // documentSender.restoreStyles('[name=button]')
  documentSender.addClasses('[name=button]', 'btn')
  documentSender.addClasses('[name=button]', 'btn') // will not add it a second time
  // documentSender.removeClasses('[name=button]', 'good ugly')
  // documentSender.toggleClasses('[name=button]', 'btn good bad')
  // documentSender.toggleClasses('[name=button]', 'btn bad')
  // documentSender.restoreClasses('[name=button]')
  documentSender.exists('[name=button]').then(r => {
    console.log('exists', JSON.stringify(r, null, 2))
  })
  const unsubscribe = documentSender.subscribe(
    '[name=button]',
    'click',
    val => {
      console.log('button clicked:', JSON.stringify(val, null, 2))
      console.log('unsubscribing from click event and removing button')
      documentSender.remove('[name=button]')
      unsubscribe()
    },
    { stopPropagation: true, preventDefault: true }
  )

  documentSender.subscribe('[name="text"]', 'input', val => {
    console.log('input changed:', JSON.stringify(val, null, 2))
    // unsubscribe()
  })

  // // TODO:
  // const unsubscribe = documentSender.subscribe('[name=button]', 'presence', val => {
  //   console.log('button presence changed:', val)
  //   // unsubscribe()
  // })

  documentSender.subscribe(
    'form',
    'submit',
    val => {
      console.log('form submitted:', JSON.stringify(val, null, 2))
    },
    { preventDefault: true }
  )

  // setTimeout(() => {
  //   documentSender.insertAdjacentHTML(
  //     'body',
  //     'beforeend',
  //     '<div name="button" class="good bad ugly" style="color:blue">hello world</div>'
  //   )
  //   setTimeout(() => {
  //     // remove the input element
  //     documentSender.remove('[name=button]')
  //   }, 2000)
  // }, 2000)
}

function runPage() {
  createPageReceiver(receiver).start()

  const pageSender = createPageSender(sender)
  pageSender.getTitle().then(r => console.log('title:', JSON.stringify(r, null, 2)))
  pageSender.getUrl().then(r => console.log('url:', JSON.stringify(r, null, 2)))
  pageSender.subscribe('title', r => {
    console.log('title changed:', JSON.stringify(r, null, 2))
  })
  pageSender.subscribe('url', r => {
    console.log('url changed:', JSON.stringify(r, null, 2))
  })
}

main()
