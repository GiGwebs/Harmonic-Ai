# Harmonic AI

An intelligent music analysis and composition platform powered by AI.

## Features

- **Audio Analysis**: Detect key, tempo, and chord progressions from audio files
- **Structure Analysis**: Analyze song structure and sections
- **Sentiment Analysis**: Understand the emotional content of lyrics
- **Interactive UI**: Modern, responsive interface for music visualization
- **Real-time Processing**: Process and analyze music in real-time

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Testing**: Jest, React Testing Library
- **Audio Processing**: Web Audio API
- **AI/ML**: Natural Language Processing, Audio Signal Processing

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Harmonic-Ai.git
cd Harmonic-Ai
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your environment variables:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

4. Start the development server:
```bash
npm run dev
```

### Running Tests

```bash
npm test
```

## Project Structure

```
src/
├── components/        # React components
├── pages/            # Page components
├── utils/            # Utility functions
│   └── analysis/     # Audio analysis utilities
├── types/            # TypeScript type definitions
├── services/         # External service integrations
└── __tests__/        # Test files
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
