/*
The main crux is that execute command and the system prompt please if you are making this project for your portfolio make sure using good models as i am also using a paid one and make sure to make more detailed system prompt

also i m using git bash as shell to execute command as in windows i was getting challenges in powershell(default) so i used bash

hope you love this one :)
*/

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';
import { exec } from 'node:child_process';
import readline from 'readline';

config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const SYSTEM_PROMPT = `
You are a helpful AI Assistant who resolves user queries.
You work on START, THINK, ACTION, OBSERVE and OUTPUT Mode.

In start phase, the user gives a query to you.
Then, you think how to resolve that query at least 3–4 times and make sure that all is clear.
If there is a need to call a tool you call an ACTION event with tool and input parameters.
If there is an ACTION call, wait for the OBSERVE that is output of the tool.
Based on the OBSERVE from the previous step, you either output or repeat the loop.

Rules:
- Always wait for next step.
- Always output a single step and wait for the next step.
- Output must be strictly **valid JSON** according to the official JSON standard (RFC 8259).
- All strings **must** be wrapped in double quotes and properly escaped. Never use single quotes in JSON strings.
- Inside JSON strings:
    - Escape double quotes as \\"
    - Escape backslashes as \\\\
    - Represent newlines as \\n, carriage returns as \\r, and tabs as \\t
    - Do not include literal line breaks inside a JSON string
- Only call tool actions from available tools.
- Strictly follow the output format in JSON.

Available Tools:
- executeCommand(command: string) : string
  Executes a given linux command on user's device and returns the stdout and stderr

Example:
START: What is weather in Ranchi?
THINK: the user is asking the weather of Ranchi
THINK: For the available tools, I must call getWeatherInfo tool for Ranchi as input
ACTION: Call Tool getWeatherInfo(Ranchi)
OBSERVE: 32 degree C
THINK: The output of getWeatherInfo for Ranchi is 32 degree C
OUTPUT: Hey, the weather of Ranchi is 32 degree C which is quite hot.

Output Example:
contents: [{ parts: [{ text: "What is the weather of Ranchi?" }] }],
{"step":"think","content":"user is asking for the weather of Ranchi"}
{"step":"think","content":"For the available tools, I must call getWeatherInfo tool for Ranchi as input"}
{"step":"action","tool":"getWeatherInfo","input":"Ranchi"}
{"step":"observe","content":"32 degree C"}
{"step":"think","content":"The output of getWeatherInfo for Ranchi is 32 degree C"}
{"step":"output","content":"Hey, the weather of Ranchi is 32 degree C which is quite hot."}

Output Format:
{"step":"string","tool":"string","input":"string","content":"string"}

MOST IMPORTANT:
- Make sure when using the execute command tool , give command very accurate as if wrong ,it can break the whole process.
- Make sure you give output proper only JSON.
`;

function askUser(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(prompt, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(
      command,
      { shell: process.env.GIT_BASH_PATH },
      function (err, stdout, stderr) {
        if (err) return reject(err);
        resolve(`stdout: ${stdout}\nstderr: ${stderr}`);
      }
    );
  });
}

const TOOLS_MAP = { executeCommand };

async function init() {
  const messages = [];
  const userQuery = await askUser('Enter your request: ');
  messages.push({ role: 'user', parts: [{ text: userQuery }] });
  while (true) {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-pro',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: { responseMimeType: 'application/json' },
    });

    let result;
    try {
      result = await model.generateContent({ contents: messages });
    } catch (err) {
      console.error('Model call error:', err);
      return;
    }

    const text = await result.response.text();
    console.log('=== MODEL RAW OUTPUT ===');
    console.log(text);
    console.log('========================');

    messages.push({ role: 'model', parts: [{ text }] });

    let parsed_response;
    try {
      parsed_response = JSON.parse(text);
    } catch (err) {
      console.error('Failed to parse model JSON. Aborting.');
      return;
    }

    if (parsed_response.step === 'think') {
      console.log(`🧠: ${parsed_response.content}`);
      continue;
    }

    if (parsed_response.step === 'output') {
      console.log(`🤖 : ${parsed_response.content}`);
      break;
    }

    if (parsed_response.step === 'action') {
      const tool = parsed_response.tool;
      const input = parsed_response.input;
      if (!TOOLS_MAP[tool]) {
        console.error('Unknown tool:', tool);
        return;
      }
      let value;
      try {
        value = await TOOLS_MAP[tool](input);
      } catch (err) {
        console.error('Tool execution error:', err);
        return;
      }
      console.log(`✂️ :  TOOL CALL ${tool} : (${input}): (${value})`);
      messages.push({
        role: 'model',
        parts: [{ text: JSON.stringify({ step: 'observe', content: value }) }],
      });
      continue;
    }
    console.error('Unrecognized step from model. Aborting.');
    return;
  }
}

init().catch((err) => {
  console.error(err);
  process.exit(1);
});
