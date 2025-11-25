const emailjs  = require('@emailjs/browser');


const contactactor = async (req,res) => {

    const data = req.body;
    console.log("data: ",data);
   await emailjs.send(process.env.EMAILJS_SERVICE_ID, process.env.EMAILJS_TEMPLATE_ID, data,process.env.EMAILJS_PUBLIC_KEY).then(
  (response) => {
    console.log('SUCCESS!', response.status, response.text);
  },
  (error) => {
    console.log('FAILED...', error);
  },
);

      res.status(200).json({message: "Succesfully sended message"});
}

module.exports = contactactor;