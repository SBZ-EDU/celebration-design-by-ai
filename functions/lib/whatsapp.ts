export async function waSendText(token: string, phoneNumberId: string, to: string, body: string) {
  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: {body},
  }
  const res = await fetch(url, {method:'POST', headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'}, body: JSON.stringify(payload)})
  return res.json()
}

export async function waSendInteractiveButtons(token: string, phoneNumberId: string, to: string, text: string, buttons: {id:string,title:string}[]) {
  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: {text},
      action: {buttons: buttons.map(b=>({type:'reply', reply:b}))}
    }
  }
  const res = await fetch(url, {method:'POST', headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'}, body: JSON.stringify(payload)})
  return res.json()
}
