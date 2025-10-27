# Healthcare Chatbot - Full-Stack Developer

An AI-powered healthcare assistant built using the **React.js** and  **Gemini API**. It provides personalized health conversations, symptom analysis, and lifestyle insights with a sleek and responsive user interface.

## Features

* **Real-time AI-powered health analysis**: Get immediate responses based on user input, powered by Gemini API.
* **Natural language conversation**: A seamless chat interface that allows users to ask health-related questions in natural language.
* **Responsive medical insights**: The app provides valuable insights about symptoms, diseases, treatments, and lifestyle tips.
* **Secure data handling**: Ensures that user data is handled securely and with privacy in mind.

## Technologies Used

* **Frontend**:

  * **React** for the user interface
  * **Tailwind CSS** for responsive, utility-first styling
* **Backend**:

  * **Gemini API** for AI-powered healthcare analysis
* **Security**: Measures to ensure data privacy and secure communications between the client and server.

## Getting Started

### Prerequisites

Before running the app locally, ensure you have the following installed:

* **Node.js** (v14 or higher)
* **npm** (v6 or higher)

You’ll also need an API key for the **Gemini API**. You can get one from [Gemini API](https://aistudio.google.com/api-keys) after creating an account.

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/SriramAalapati/Healthcare-chatbot
```

2. **Navigate to the project folder**

```bash
cd healthcare-chatbot
```

3. **Install dependencies**

```bash
npm install
```

4. **Set up environment variables**

Create a `.env` file in the root of the project and add your Gemini API key:

```
GEMINI_API_KEY=your-api-key-here
```

5. **Start the development server**

```bash
npm start
```

The app should now be live at `http://localhost:3000`.

## Usage

Once the app is running:

* Open the app in your browser.
* You’ll be able to interact with the AI-powered chatbot to ask health-related questions.
* The assistant will analyze symptoms, provide lifestyle recommendations, and more.

## Testing

To test the application locally, make sure you have a `.env` file configured with the correct API key and other environment variables.

### Unit Tests

You can run unit tests for the frontend using:

```bash
npm test
```

### Linting

To ensure code quality and consistency, you can run linting using:

```bash
npm run lint
```

## Contributing

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to your branch: `git push origin feature/new-feature`
5. Create a new Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

* **Gemini API** for the powerful AI-based health analysis.
* **Tailwind CSS** for the utility-first CSS framework.
* **React** for creating the interactive UI components.

---

