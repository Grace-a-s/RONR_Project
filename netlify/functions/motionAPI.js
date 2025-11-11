/*export default async (req, context) => {
  return Response.json({ message: "Hello world!" });
};*/
//const data = require("./motion.json");
/*const headers = {
  "content-type": 'application/json',
  'Access-Control-Allow-Origin': "*"
}

exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify(data),
    //headers: headers
  };
};
*/
export default async (req, context) => {
  const data = new Response("Hello World!");
  return { data };
};

//export const message = "Hello World";
