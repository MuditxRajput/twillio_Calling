import express from 'express';
import twilio from 'twilio';
// onst bodyParser = require('body-parser');
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
const app = express();
app.use(bodyParser.urlencoded({extended:false}));
dotenv.config();
const port = 8080; 
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = new twilio(accountSid,authToken);

// numbers..
const number = +13512070336;
const callingTo = +911234567890;
const interviewLink = 'https://v.personaliz.ai/?id=9b697c1a&uid=fe141702f66c760d85ab&mode=test';

// calling...

client.calls.create({
    url :  "https://0ef6-103-104-203-223.ngrok-free.app/twiml",
    to: callingTo,
    from: number,
})
.then((call)=>console.log(`call initiated with SID : ${call.sid}`)
).catch((error)=>console.log(error)
);

// handle the calling ....
app.post('/twiml',(req,res)=>{
    const twiml  = new twilio.twiml.VoiceResponse();
    twiml.say("hello, press 1 to recieve your personalized interview link.");
    twiml.gather({
        numDigits:1,
        action: '/ivr',
        method:'POST',
    });
    res.type('text/xml');
    res.send(twiml.toString());
})

app.post('/ivr',(req,res)=>{
    const twiml = new twilio.twiml.VoiceResponse();
    console.log("Number press by the user",req.body.Digits);
    
    if(req.body.Digits==='1'){
        twiml.say("Thank you. A personalized interview link will be sent to you.");

        client.messages.create({
            body: `Here is your personalized interview link: ${interviewLink}`,
            from: number,
            to: callingTo,
        })
        .then((message) => console.log(`SMS sent with SID: ${message.sid}`))
        .catch((error) => console.error(error));
    }
    else{
        twiml.say('Invalid input. Please try again.');
    twiml.redirect('/ivr');  
    }
    res.type('text/xml');
    res.send(twiml.toString());
});

app.listen(port,()=>{console.log(`server is listing at port ${port}`);
})

