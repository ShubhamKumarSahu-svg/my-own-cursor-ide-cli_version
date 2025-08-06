# my-cusor-ai

## Overview

my-cusor-ai is an interactive AI assistant CLI tool powered by Google Gemini (Generative AI). It allows users to resolve queries and automate tasks using natural language, with support for executing shell commands on Windows via Git Bash. The assistant follows a structured reasoning process (START, THINK, ACTION, OBSERVE, OUTPUT) and strictly outputs valid JSON for each step.

## Features

- **AI-powered assistant** using Google Gemini 2.5 Pro
- **Structured reasoning**: START, THINK, ACTION, OBSERVE, OUTPUT
- **Tool integration**: Executes shell commands via Git Bash
- **Strict JSON output** for easy parsing and automation
- **Environment configuration** via `.env` file
- **Modern JavaScript (ESM) and Node.js**

## Getting Started

### Prerequisites

- Node.js v18 or higher
- Git Bash installed (for Windows) (recommended for executing shell commands)
- Google Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd my-cusor-ai
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory:
   ```properties
   GEMINI_API_KEY=your-gemini-api-key
   GIT_BASH_PATH=C:\Program Files\Git\bin\bash.exe (mine was installed in this path)
   ```

### Usage

Start the assistant in development mode:

```bash
npm run dev
```

You will be prompted to enter your request. The assistant will process your query step-by-step, outputting each reasoning phase in valid JSON.

#### Example Query

```
Create a folder named "calculator-app" and inside it build a fully functional calculator using HTML, CSS, and JavaScript. The calculator should have buttons for numbers 0–9, basic arithmetic operations (+, −, ×, ÷), a clear button, and an equals button. It should display the input and result in a screen area. Use modern styling with CSS and ensure the layout is responsive.
```

#### Example Output

```
{"step":"think","content":"user is asking for a calculator app"}
{"step":"action","tool":"executeCommand","input":"mkdir calculator-app"}
{"step":"observe","content":"stdout: ...\nstderr: ..."}
...
{"step":"output","content":"Calculator app created successfully."}
```

## Project Structure

- `index.js`: Main entry point, handles user interaction, AI reasoning, and tool execution
- `package.json`: Project metadata and scripts
- `.env`: Environment variables (API key, shell path)

## Developer Guide

### Adding New Tools

To add a new tool:

1. Implement the tool function in `index.js`.
2. Add the tool to the `TOOLS_MAP` object.
3. Update the `SYSTEM_PROMPT` to document the new tool and its input/output format.

### Modifying Reasoning Steps

- The assistant expects the model to output steps in strict JSON format.
- Each step must include:
  - `step`: One of `think`, `action`, `observe`, `output`
  - `tool`: Tool name (for `action`)
  - `input`: Tool input (for `action`)
  - `content`: Reasoning or result

### Error Handling

- Model errors and tool execution errors are logged to the console.
- If the model outputs invalid JSON, the process aborts with an error message.

### Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini API key
- `GIT_BASH_PATH`: Path to Git Bash executable (for Windows)

## Contributing

Pull requests and suggestions are welcome! Please ensure your code follows the existing style and includes clear documentation for any new features or tools.

## License

ISC

## Author

Shubham Kumar Sahu
