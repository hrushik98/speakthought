# SpeakThought 🗣️✨

**T2Todo - Transform your thoughts into actionable todos with AI**

A beautiful, modern web application that converts your speech into organized todo lists using AI-powered transcription and natural language processing.

![SpeakThought Preview](https://img.shields.io/badge/Status-Live-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## ✨ Features

- 🎤 **Real-time Voice Recording** - Capture your thoughts with a single click
- 🌊 **Voice-Reactive Waveform** - Beautiful, real-time audio visualization that responds to your voice
- 🤖 **AI-Powered Transcription** - Convert speech to text using Whisper API
- 📝 **Smart Todo Extraction** - Automatically identify and organize actionable items from your speech
- 🌙 **Modern Dark UI** - Stunning gradient design with smooth animations
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- 💾 **Local Storage** - Your todos persist between sessions
- 🔄 **Real-time Status** - Clear indicators for transcribing and generating phases

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key (for Whisper and GPT)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hrushik98/speakthought.git
   cd speakthought
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 How It Works

1. **Click the microphone** - The beautiful gradient button starts recording
2. **Speak your thoughts** - Watch the real-time waveform react to your voice
3. **Stop recording** - Click the microphone again to stop
4. **AI Processing** - Your speech is transcribed and processed to extract todos
5. **Get organized** - Review and manage your automatically generated todo list

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **AI/ML**: OpenAI Whisper (speech-to-text), GPT (todo extraction)
- **Audio**: Web Audio API for real-time visualization
- **Styling**: Tailwind CSS with custom gradients and animations
- **State Management**: React hooks with localStorage persistence

## 🎨 UI/UX Highlights

- **Dark Theme**: Elegant dark background with vibrant gradient accents
- **Real-time Feedback**: Voice-reactive waveform visualization
- **Status Indicators**: Clear visual feedback for each processing stage
- **Smooth Animations**: Micro-interactions that enhance user experience
- **Responsive Layout**: Optimized for all screen sizes

## 📱 Screenshots

*[Screenshots coming soon]*

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenAI for the Whisper and GPT APIs
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first styling approach

---

**Made with ❤️ by Hrushik**

*Turn your thoughts into action, one word at a time.* 🚀