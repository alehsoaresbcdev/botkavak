const makeWaSocket = require('@adiwajshing/baileys').default
const { delay, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@adiwajshing/baileys')
const { unlink, existsSync, mkdirSync } = require('fs')
const P = require('pino')
const ZDGPath = './ZDGSessions/'
const ZDGAuth = 'auth_info.json'
// var temp = 0

[
   {
     "name": "Molecule Man",
     "age": 29,
     "secretIdentity": "Dan Jukes",
     "powers": [
       "Radiation resistance",
       "Turning tiny",
       "Radiation blast"
     ]
   },
   {
     "name": "Madame Uppercut",
     "age": 39,
     "secretIdentity": "Jane Wilson",
     "powers": [
       "Million tonne punch",
       "Damage resistance",
       "Superhuman reflexes"
     ]
   }
]

const ZDGBtn1 = {
   id: 'ZDGContinuar',
   displayText: 'CONTINUAR',
}

const ZDGBtn2 = {
   id: 'ZDGSair',
   displayText: 'SAIR',
}

const ZDGbtnMD1 = [
   { index: 1, quickReplyButton: ZDGBtn1 },
   { index: 2, quickReplyButton: ZDGBtn2 },
]

const KVKBtn3 = {
   id: 'ZVKSim',
   displayText: 'SIM',
}

const KVKBtn4 = {
   id: 'KVKNao',
   displayText: 'NÃO',
}

const KVKbtnMD2 = [
   { index: 1, quickReplyButton: KVKBtn3 },
   { index: 2, quickReplyButton: KVKBtn4 },
]

const ZDGurlBtn1 = {
   url: 'http://kavak.com/br',
   displayText: 'Comunidade ZDG',
}

const ZDGurlBtn2 = {
   url: 'http://kavak.com/br',
   displayText: 'Passaporte ZDG',
}

const ZDGreplyBtn1 = {
   id: 'zdg1',
   displayText: 'Curte',
}

const ZDGreplyBtn2 = {
   id: 'zdg2',
   displayText: 'Compartilha',
}

const callButton = {
   displayText: 'Ligar agora ☎️',
   phoneNumber: '+55 35 9 8875-4197',
}

const ZDGbtnMD = [
   { index: 0, urlButton: ZDGurlBtn1 },
   { index: 1, urlButton: ZDGurlBtn2 },
   { index: 2, callButton },
   { index: 3, quickReplyButton: ZDGreplyBtn1 },
   { index: 4, quickReplyButton: ZDGreplyBtn2 },
]

const ZDGGroupCheck = (jid) => {
   const regexp = new RegExp(/^\d{18}@g.us$/)
   return regexp.test(jid)
}

const ZDGUpdate = (ZDGsock) => {
   ZDGsock.on('connection.update', ({ connection, lastDisconnect, qr }) => {
      if (qr){
         console.log('© BOT-ZDG - Qrcode: ', qr);
      };
      if (connection === 'close') {
         const ZDGReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
         if (ZDGReconnect) ZDGConnection()
         console.log(`© BOT-ZDG - CONEXÃO FECHADA! RAZÃO: ` + DisconnectReason.loggedOut.toString());
         if (ZDGReconnect === false) {
            const removeAuth = ZDGPath + ZDGAuth
            unlink(removeAuth, err => {
               if (err) throw err
            })
         }
      }
      if (connection === 'open'){
         console.log('© BOT-ZDG - CONECTADO')
      }
   })
}

const ZDGConnection = async () => {
   const { version } = await fetchLatestBaileysVersion()
   if (!existsSync(ZDGPath)) {
      mkdirSync(ZDGPath, { recursive: true });
   }
   const { saveState, state } = useSingleFileAuthState(ZDGPath + ZDGAuth)
   const config = {
      auth: state,
      logger: P({ level: 'error' }),
      printQRInTerminal: true,
      version,
      connectTimeoutMs: 60_000,
      async getMessage(key) {
         return { conversation: 'botzg' };
      },
   }
   const ZDGsock = makeWaSocket(config);
   ZDGUpdate(ZDGsock.ev);
   ZDGsock.ev.on('creds.update', saveState);

   const ZDGSendMessage = async (jid, msg) => {
      await ZDGsock.presenceSubscribe(jid)
      await delay(2000)
      await ZDGsock.sendPresenceUpdate('composing', jid)
      await delay(1500)
      await ZDGsock.sendPresenceUpdate('paused', jid)
      return await ZDGsock.sendMessage(jid, msg)
   }

   function isBlank(str) {
      return (!str || /^\s*$/.test(str));
   }

   ZDGsock.ev.on('messages.upsert', async ({ messages, type }) => {

   const msg = messages[0]
   const ZDGUsuario = msg.pushName
   const jid = msg.key.remoteJid
   const conversation = msg.message.conversation
   const listResponse = msg.message.listResponseMessage
   const buttonResponse = msg.message.templateButtonReplyMessage
   const extendedTextMessage = msg.message.extendedTextMessage
   const templateMessage = msg.message.templateMessage
   const listMessage = msg.message.listMessage

      if (!msg.key.fromMe && jid !== 'status@broadcast' && !ZDGGroupCheck(jid)) {

         console.log("© BOT-ZDG - MENSAGEM : ", msg)

         try{
            ZDGsock.sendReadReceipt(jid, msg.key.participant, [msg.key.id])
         }
         catch(e){
            console.log('© BOT-ZDG - Não foi possível enviar o ReadReceipt')
         }

         // MENSAGEM DO BOTAO
         if(isBlank(conversation) && isBlank(listResponse) && isBlank(extendedTextMessage)){
            if (msg.message.templateButtonReplyMessage.selectedId === 'ZDGContinuar' || 
                msg.message.templateButtonReplyMessage.selectedId === 'ZVKSim'){
               // const templateVideo = {
               //    // opicional
               //    caption: '```ZAP das Galáxias```\n\n😎 *Faça com um dos mais de 900 alunos da Comunidade e consiga a sua independência financeira explorando todo o poder gratuito da API do WhatsApp, mesmo que você não seja programador.*\n',
               //    // opicional
               //    footer: '© BOT-ZDG',
               //    video: {
               //       url: './assets/zdg.mp4',
               //    },
               //    mimetype: 'video/mp4',
               //    gifPlayback: true,
               //    templateButtons: ZDGbtnMD
               // }
               // ZDGSendMessage(jid, templateVideo)
               //    .then(result => console.log('RESULT: ', result))
               //    .catch(err => console.log('ERROR: ', err))
               // Lista
               const sections = [
                  {
                     title: 'Padrões Partes Externas',
                     rows: [
                        { title: 'Buzina', description: 'A-BR00-CTO-WIN4', rowId: 'WIN4' },
                     ],
                  },
                  {
                     title: 'Padrões Partes Internas',
                     rows: [
                        { title: 'Acabementos Internos', description: 'A-BR00-CTO-WIN1', rowId: 'WIN1' },
                        { title: 'Assentos', description: 'A-BR00-CTO-WIN2', rowId: 'WIN2' },
                     ],
                  },
                  {
                     title: 'Outros Padrões',
                     rows: [
                        { title: 'Bateria', description: 'A-BR00-CTO-WIN3', rowId: 'WIN3' },
                     ],
                  },
               ]    
               const sendList = {
                  title: '🚘 *Padrões KAVAK* 🚗\n',
                  text: 'Selecione o padrão\n',
                  buttonText: 'Padrões',
                  footer: '©BOT-KVK',
                  sections: sections
               }
               ZDGSendMessage(jid, sendList)
                  .then(result => console.log('RESULT: ', result))
                  .catch(err => console.log('ERROR: ', err))                          
            }
            if (msg.message.templateButtonReplyMessage.selectedId === 'ZDGSair') {     
               ZDGSendMessage(jid, { text: '*' + ZDGUsuario + '* , muito obrigado pelo seu contato.' })
                  .then(result => console.log('RESULT: ', result))
                  .catch(err => console.log('ERROR: ', err))
            }
            if (msg.message.templateButtonReplyMessage.selectedId === 'KVKNao') {     
               ZDGSendMessage(jid, { text: 'Certo, bom trabalho!\n\nPara efetuar uma nova consulta, envie uma mensagem para iniciar o atendimento.' })
                  .then(result => console.log('RESULT: ', result))
                  .catch(err => console.log('ERROR: ', err))
            }            
         }

         // MENSAGEM DA LISTA
         if(isBlank(conversation) && isBlank(buttonResponse && isBlank(extendedTextMessage))){
            if (msg.message.listResponseMessage.title === 'Acabementos Internos'){
               ZDGSendMessage(jid, {
                  forward: {
                     key: { fromMe: true },
                     message: {
                        extendedTextMessage: {
                           text: 'https://kvkto.click/A-BR00-CTO-WIN1',
                           matchedText: 'https://kvkto.click/A-BR00-CTO-WIN1',
                           canonicalUrl: 'https://kvkto.click/A-BR00-CTO-WIN1',
                           title: 'A-BR00-CTO-WIN1',
                           description: 'KAVAK',
                           // opicional
                           //jpegThumbnail: readFileSync('./assets/icone.png')
                        }
                     }
                  }
               })
                  .then(result => console.log('RESULT: ', result))
                  .catch(err => console.log('ERROR: ', err))               
            }
            if (msg.message.listResponseMessage.title === 'Assentos'){

               // const sendVideo = {
               //    // opicional
               //    caption: '```K A V A K```',
               //    video: {
               //       url: './assets/bancos.mp4',
               //    },
               //    mimetype: 'video/mp4',
               //    gifPlayback: true
               // }
               // ZDGSendMessage(jid, sendVideo)
               //    .then(result => console.log('RESULT: ', result))
               //    .catch(err => console.log('ERROR: ', err))               


               ZDGSendMessage(jid, {
                  forward: {
                     key: { fromMe: true },
                     message: {
                        extendedTextMessage: {
                           text: 'https://kvkto.click/A-BR00-CTO-WIN2',
                           matchedText: 'https://kvkto.click/A-BR00-CTO-WIN2',
                           canonicalUrl: 'https://kvkto.click/A-BR00-CTO-WIN2',
                           title: 'A-BR00-CTO-WIN2',
                           description: 'KAVAK',
                           // opicional
                           //jpegThumbnail: readFileSync('./assets/icone.png')
                        }
                     }
                  }
               })
                  .then(result => console.log('RESULT: ', result))
                  .catch(err => console.log('ERROR: ', err))               
            }                        
            if (msg.message.listResponseMessage.title === 'Bateria'){
               ZDGSendMessage(jid, {
                  forward: {
                     key: { fromMe: true },
                     message: {
                        extendedTextMessage: {
                           text: 'https://kvkto.click/A-BR00-CTO-WIN3',
                           matchedText: 'https://kvkto.click/A-BR00-CTO-WIN3',
                           canonicalUrl: 'https://kvkto.click/A-BR00-CTO-WIN3',
                           title: 'A-BR00-CTO-WIN3',
                           description: 'KAVAK',
                           // opicional
                           //jpegThumbnail: readFileSync('./assets/icone.png')
                        }
                     }
                  }
               })
                  .then(result => console.log('RESULT: ', result))
                  .catch(err => console.log('ERROR: ', err))               
            }   
            if (msg.message.listResponseMessage.title === 'Buzina'){
               ZDGSendMessage(jid, {
                  forward: {
                     key: { fromMe: true },
                     message: {
                        extendedTextMessage: {
                           text: 'https://kvkto.click/A-BR00-CTO-WIN4',
                           matchedText: 'https://kvkto.click/A-BR00-CTO-WIN4',
                           canonicalUrl: 'https://kvkto.click/A-BR00-CTO-WIN4',
                           title: 'A-BR00-CTO-WIN4',
                           description: 'KAVAK',
                           // opicional
                           //jpegThumbnail: readFileSync('./assets/icone.png')
                        }
                     }
                  }
               })
                  .then(result => console.log('RESULT: ', result))
                  .catch(err => console.log('ERROR: ', err))               
            }                      
         }

         // MENSAGEM DA CONVERSA
         if(isBlank(listResponse) && isBlank(buttonResponse) && isBlank(extendedTextMessage)) {
            // // Teste
            // console.log('temp: ' + temp);
            // temp = temp + 1;
            // ZDGSendMessage(jid, { text: '*' + ZDGUsuario + '* , muito obrigado pelo seu contato número ' +  temp})   
                     
            // .then(result => console.log('RESULT: ', result))
            // .catch(err => console.log('ERROR: ', err))
            // // FIM-Teste
            const ZDGbtnImage = {
               caption: '\n Olá *'+  ZDGUsuario +  '*, seja bem vindo à consulta de Padrões da Kavak Brasil! \n Escolha uma opção!\n',
               footer: '✅ Ao continuar você concorda com os Termos de Uso e Política de Privacidade',
               image: {
                  url: './assets/logokavak.png',
               },
               templateButtons: ZDGbtnMD1
            }
            ZDGSendMessage(jid, ZDGbtnImage)
               .then(result => console.log('RESULT: ', result))
               .catch(err => console.log('ERROR: ', err))
            // const sections = [
            //    {
            //       title: '🔥 TREINAMENTOS MAIS VENDIDOS',
            //       rows: [
            //          { title: '#1 - COMUNIDADE ZDG', description: '\n+ de 200 vídeo-aulas, suporte pessoal e grupo de alunos. Todas as soluções para copiar e colar. \n 👉 https://zapdasgalaxias.com.br/', rowId: 'zdg1' },
            //          { title: '#2 - PASSAPORTE ZDG', description: '\nCurso avançado de Whaticket com chatbot via mysql, dialogflow texto e áudio, n8n, agendamento de mensagem, horário de atendimento e limite de conexões e usuários. \n 👉 https://zapdasgalaxias.com.br/passaporte-zdg/', rowId: 'zdg2' },
            //       ],
            //    },
            //    {
            //       title: '💎 Treinamentos Básicos ',
            //       rows: [
            //          { title: '#3 - WHATICKET ZDG', description: '\nIncluso na Comunidade ZDG \n👉 https://zapdasgalaxias.com.br/contabo-whaticket/', rowId: 'zdg3' },
            //          { title: '#4 - BAILEYS ZDG', description: '\nIncluso na Comunidade ZDG \n👉 https://zapdasgalaxias.com.br/oferta-baileys/', rowId: 'zdg5' },
            //          { title: '#5 - VENOM-BOT ZDG', description: '\nIncluso na Comunidade ZDG \n👉 https://zapdasgalaxias.com.br/oferta-venombot/', rowId: 'zdg6' },
            //          { title: '#6 - WOOCOMMERCE + ELEMENTOR ZDG', description: '\nIncluso na Comunidade ZDG \n👉 https://zapdasgalaxias.com.br/oferta-woocommerce/', rowId: 'zdg7' },
            //          { title: '#7 - BUBBLE ZDG', description: '\nIncluso na Comunidade ZDG \n👉 https://zapdasgalaxias.com.br/oferta-bubble/', rowId: 'zdg8' },
            //          { title: '#8 - API + CHATBOT ZDG', description: '\nIncluso na Comunidade ZDG \n👉 https://zapdasgalaxias.com.br/oferta-api/', rowId: 'zdg9' },
            //       ],
            //    },
            //    {
            //       title: '📱 Números virtuais pré-ativado',
            //       rows: [
            //          { title: '#9 - ZDGNumbers', description: '\nLink \n👉 https://zdg.numbersbr.com/', rowId: 'zdg10' },
            //       ],
            //    },
            // ]
            // const sendList = {
            //    title: ZDGUsuario + ', seja bem vindo ao atendimento\n🚀 *ZAP das Galáxias* 🚀\n',
            //    text: 'Clique no botão para conhecer nossos treinamentos\n',
            //    buttonText: 'Clique aqui mesmo que você não seja programador',
            //    footer: '©BOT-ZDG',
            //    sections: sections
            // }
            // ZDGSendMessage(jid, sendList)
            //    .then(result => console.log('RESULT: ', result))
            //    .catch(err => console.log('ERROR: ', err))
         } 

      }else if (jid !== 'status@broadcast' && !ZDGGroupCheck(jid)){
         // MENSAGEM DO LINK
         console.log('Vai verificar se é link')
         console.log("© XXXXXX - MENSAGEM : ", msg)
         if(isBlank(listResponse) && isBlank(buttonResponse) && isBlank(conversation) && isBlank(templateMessage) && isBlank(listMessage)) {    
            console.log('É link')
            if (msg.message.extendedTextMessage.description === 'KAVAK'){
            // // Teste
            // ZDGSendMessage(jid, { text: '*' + ZDGUsuario + '* , veio do link!!! '})   
                     
            // .then(result => console.log('RESULT: ', result))
            // .catch(err => console.log('ERROR: ', err))
            // // FIM-Teste
            const ZDGbtnImage2 = {
               caption: 'Você gostaria de consultar outro padrão?',
               footer: 'K A V A K',
               image: {
                  url: './assets/logokavak.png',
               },
               templateButtons: KVKbtnMD2
            }
            ZDGSendMessage(jid, ZDGbtnImage2)
               .then(result => console.log('RESULT: ', result))
               .catch(err => console.log('ERROR: ', err))            
            }
         }    
      }
   })

}

ZDGConnection()