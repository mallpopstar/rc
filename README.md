# Remote Control

Remote Control is a JavaScript library that allows you to perform actions on a website from a remote location. It's a light-weight alternative to heavier libraries that use Chromium on the server. It can be used to automate repetitive tasks, query and modify DOM, or interact with a website in an automated fashion from the server or admin panel.

### What can I do?

Many things that you can do using JavaScript on a website can be done remotely with Remote Control. Here are a few examples to get you started:

- Interact with a website in an automated fashion
- Automate testing of your website
- Automate repetitive tasks
- Intercept and modify network requests
- Read and write to the DOM
- Event listening on DOM elements
- Capture errors and exceptions

### Use cases

Sometimes using VMs to connect to your website is overkill. Here are some use cases you can setup Remote Control to do:

- Provide support to customers
- Check for performance issues, CPU usage, network lag, etc.
- Capture errors
- Insert DOM onto the page without having to add it to a web application (especially, if its temporary)
- Listen to events and send them back to a server.

### What Remote Control is not

Remote Control is not a e2e or unit testing framework. Instead, it can be used in conjunction with testing libraries to automate testing of your website, such as [Vitest](https://vitest.dev/) or [Jest](https://jestjs.io/).

Remote Control is not a web scraping framework. Instead, it can be used in conjunction with web scraping libraries to scrape content from websites, such as [Cheerio](https://github.com/cheeriojs/cheerio) or [Puppeteer](https://pptr.dev/).

Remote Control is not a browser automation framework. Instead, it can be used in conjunction with browser automation libraries to automate browsers, such as [Playwright](https://playwright.dev/) or [Puppeteer](https://pptr.dev/).

Remote Control does not provide security out of the box. It is only the communications layer. You will be responsible for implementing security measures to prevent malicious actors from sending requests to all users.

### How does it work?

Remote Control is a collection of modules that perform actions on your website. Depending on your use cases, you may need to only to use some of the modules in Remote Control. Unused modules will not be included in your bundle.

Remote Control is built on top of [Partyline ☎️](https://github.com/mallpopstar/partyline) to communicate with your website. It uses protocols that are already built into your browser, so there is no need to run a browser in a virtual machine.

Unlike the alternatives below, Remote Control does not use a VM or Chromium browser. It requires having the `receiver` exist on the website you want to control. This is a security feature to prevent malicious actors from controlling your website. If you want to control a website that you do not own, you can use a browser extension to inject the receiver into the website.

## Getting Started

### Installation

Install Remote Control using npm:

```bash
npm install @mallpopstar/rc
```

### CDN

You can use Remote Control without installing it by using a CDN. You can use either [unpkg](https://unpkg.com/) or [jsDelivr](https://www.jsdelivr.com/). If you use a CDN, you can access the library via the `Partyline` global variable.

You will also need to include the Partyline library. You can use the same CDN for Partyline. Refer to the [Partyline documentation](https://github.com/mallpopstar/partyline)

**Using unpkg**

```html
<script src="https://unpkg.com/@mallpopstar/rc@latest/dist/rc.min.js"></script>
```

**Using jsDelivr**

```html
<script src="https://cdn.jsdelivr.net/npm/@mallpopstar/rc@latest/dist/rc.min.js"></script>
```

The libraries will be available on global variables named `partyline` and `remotecontrol`.

```js
const { createReceiver, createSender } = partyline
// depending on your use case, you may only need to use some of the modules in Remote Control
const { createDocumentReceiver, createDocumentSender } = remotecontrol
```

### Usage

Each module in Remote Control consists of two parts:
- A receiver that runs on your website. It listens for commands from the remote control and executes them.
- A sender that can run from various locations: server, another website, or your local machine. It send requests to the receiver.

Here is an example of how to use the listen to a form submission on your website using a BroadcastChannel:

#### Receiver

```ts
import { createReceiver } from '@mallpopstar/partyline'
import { createDocumentReceiver } from '@mallpopstar/rc'

const channel = new BroadcastChannel('my-channel')
const receiver = createReceiver()

receiver.connect(channel)
createDocumentReceiver(receiver).start()
```

#### Sender

```ts
import { createSender } from '@mallpopstar/partyline'
import { createDocumentSender } from '@mallpopstar/rc'

const channel = new BroadcastChannel('my-channel')
const sender = createSender()
sender.connect(channel)
const documentSender = createDocumentSender(sender)

documentSender.subscribe('form', 'submit', req => {
  console.log('form submitted:', req)
}, { preventDefault: true })
```

#### What is happening?

In this example...
1. We are listening to a form submission on your website. 
2. When the form is submitted, the receiver will send a message to the sender. 
3. The sender will then log the message to the console. The sender will also prevent the default behavior of the form submission. 

We are using BroadcastChannel to communicate between the receiver and the sender. You can use any communication channel (window, iframe, web worker, MessageChannel, BroadcastChannel, WebSocket, WebRTC, etc). Partyline allows build your own communication channel if you need to.

The BroadcastChannel allows us to perform actions on your website from another browser without the need of communicating with a server. This is useful for automating tasks on your website from your local machine.


## Running the examples in this repo

Clone the repo and run the following commands:

```bash
npm install
npm run dev
```

## Q&A

### How can I connect to users on my website?

Remote Control provides the hooks for you to do this but you are responsible for implementing the communication channel using (ex, BroadcastChannel, WebSocket, WebRTC, HTTP polling, etc).

> ⚠️ **Warning:** You will be responsible for implementing security measures to prevent malicious actors from sending requests to all users.

**BroadcastChannel**

Broadcast doesn't require a server. If you are using BroadcastChannel, you can use the [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel) to send messages to all users, where the channel name is the same for all users.

**WebSocket**

If you are using WebSocket, you can use the [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) to send messages to all users, where the WebSocket URL is the same for all users.

**WebRTC**

WebRT is a peer-to-peer protocol. If you are using WebRTC, you will need to implement a signaling server to connect users. You can use the [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API) to send messages to all users.

## Roadmap

- [ ] Better Documentation (right now, use examples in [src/main.ts](src/main.ts))
- [X] Intercept errors and reporting them (think [LogRocket](https://logrocket.com/))
- [X] Example using WebSocket (see [examples/websocket](examples/websocket))
- [ ] Example using WebRTC
- [ ] Example using Custom Channel 

## Alternatives to Remote Control

Remote Control may meet the needs of what you are trying to accomplish. However, there are many other tools that may be better suited for your use case. Here are some alternatives to Remote Control:

### DOM Frameworks and Libraries

#### HTMLX

[HTMLX](https://github.com/bigskysoftware/htmx) allows you to access AJAX, CSS Transitions, WebSockets and Server Sent Events directly in HTML, using attributes, so you can build modern user interfaces with the simplicity and power of hypertext.

#### Hyperscript

[Hyperscript](https://hyperscript.org/) enhances HTML with concise DOM, event and async features. Make writing interactive HTML a joy. It is possible that Remote Control could be used in conjunction with Hyperscript to create a powerful framework for building interactive websites.

### Worker Libraries

#### Partytown

[Partytown](https://partytown.builder.io/) is a lazy-loaded library to help relocate resource intensive scripts into a web worker, and off of the main thread. Its goal is to help speed up sites by dedicating the main thread to your code, and offloading third-party scripts to a web worker.

### Testing Frameworks

If you are looking for something more robust testing suite, here are some alternatives to Remote Control:

#### Playwright

[Playwright](https://playwright.dev/) is a Node library to automate Chromium, Firefox and WebKit with a single API. Playwright is built to enable cross-browser web automation that is ever-green, capable, reliable and fast.

#### Cypress

[Cypress](https://www.cypress.io/) is a JavaScript End to End Testing Framework. It is a complete end-to-end testing experience that includes unit testing, mocking, spying, stubbing, and server mocking.

#### Puppeteer

[Puppeteer](https://pptr.dev/) is a Node library that provides a high-level API to control Chrome or Chromium over the DevTools Protocol. Puppeteer runs headless by default, but can be configured to run full (non-headless) Chrome or Chromium.

#### Selenium

[Selenium](https://www.selenium.dev/). Selenium is a suite of tools for automating web browsers.

## License

Remote Control is licensed under the MIT license.
