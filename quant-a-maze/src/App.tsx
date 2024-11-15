
// import React, { useState, useEffect } from 'react';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Mic, MicOff, Loader2 } from 'lucide-react';

// interface Results {
//   [key: string]: string | { description: string; output: string } | null;
// }

// interface SocialMediaPost {
//   description: string;
//   output: string;
// }

// interface SocialMedia {
//   linkedin?: SocialMediaPost;
//   twitter?: SocialMediaPost;
// }

// const CrewAIContentGenerator: React.FC = () => {
//   const [textInput, setTextInput] = useState<string>('');
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [results, setResults] = useState<Results | { error: string }>({});
//   const [linkedinPost, setLinkedinPost] = useState<SocialMediaPost | null>(null);
//   const [twitterPost, setTwitterPost] = useState<SocialMediaPost | null>(null);
//   const [isListening, setIsListening] = useState<boolean>(false);
//   const [recognition, setRecognition] = useState<any>(null);
//   const [interimTranscript, setInterimTranscript] = useState<string>('');

//   useEffect(() => {
//     if (window.webkitSpeechRecognition) {
//       const recognition = new window.webkitSpeechRecognition();
//       recognition.continuous = true;
//       recognition.interimResults = true;

//       recognition.onresult = (event: any) => {
//         let finalTranscript = '';
//         let currentInterim = '';

//         for (let i = event.resultIndex; i < event.results.length; i++) {
//           const transcript = event.results[i][0].transcript;
//           if (event.results[i].isFinal) {
//             finalTranscript += transcript;
//           } else {
//             currentInterim += transcript;
//           }
//         }

//         // Only update the text input when we have a final transcript
//         if (finalTranscript) {
//           setTextInput(prevInput => {
//             const newInput = prevInput ? `${prevInput.trim()} ${finalTranscript}` : finalTranscript;
//             return newInput.charAt(0).toUpperCase() + newInput.slice(1);
//           });
//         }
//         setInterimTranscript(currentInterim);
//       };

//       recognition.onerror = (event: any) => {
//         console.error('Speech recognition error:', event.error);
//         setIsListening(false);
//       };

//       recognition.onend = () => {
//         setIsListening(false);
//         setInterimTranscript('');
//       };

//       setRecognition(recognition);
//     }
//   }, []);

//   const toggleListening = () => {
//     if (!recognition) {
//       alert('Speech recognition is not supported in your browser');
//       return;
//     }

//     if (isListening) {
//       recognition.stop();
//       setIsListening(false);
//       setInterimTranscript('');
//     } else {
//       recognition.start();
//       setIsListening(true);
//     }
//   };

//   const clearInput = () => {
//     setTextInput('');
//     setInterimTranscript('');
//   };

//   const handleGenerateContent = async () => {
//     if (!textInput.trim()) {
//       alert('Please enter a topic or content request.');
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const response = await fetch('http://127.0.0.1:5000/process_input', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ text: textInput }),
//       });

//       const data: {
//         success: boolean;
//         results: Results;
//         error?: string;
//         social_media?: SocialMedia;
//       } = await response.json();

//       if (data.success) {
//         setResults(data.results);
//         if (data.social_media) {
//           setLinkedinPost(data.social_media.linkedin || null);
//           setTwitterPost(data.social_media.twitter || null);
//         }
//       } else {
//         setResults({ error: data.error || 'An unknown error occurred.' });
//       }
//     } catch (error) {
//       setResults({ error: String(error) });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Card className="w-full mx-auto my-8 p-6 shadow-xl rounded-lg bg-gray-900">
//       <CardHeader className="bg-gray-900 text-white p-4">
//         <CardTitle className="text-2xl font-semibold">
//           CrewAI Content Generator
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="bg-gray-100 p-6">
//         <div className="mb-6">
//           <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
//             Enter a topic or content request:
//           </label>
//           <div className="flex gap-2">
//             <div className="flex-1 relative">
//               <input
//                 type="text"
//                 id="text-input"
//                 className="border border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 value={textInput}
//                 onChange={(e) => setTextInput(e.target.value)}
//                 placeholder="e.g., AI-generated story"
//               />
//               {interimTranscript && (
//                 <div className="absolute left-0 right-0 top-full mt-1 p-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-600">
//                   {interimTranscript}
//                 </div>
//               )}
//             </div>
//             <button
//               onClick={clearInput}
//               className="p-3 rounded-md bg-gray-500 hover:bg-gray-600 text-white"
//               title="Clear input"
//             >
//               ✕
//             </button>
//             <button
//               onClick={toggleListening}
//               className={`p-3 rounded-md transition-colors duration-200 ${
//                 isListening 
//                   ? 'bg-red-500 hover:bg-red-600' 
//                   : 'bg-blue-500 hover:bg-blue-600'
//               } text-white`}
//               title={isListening ? 'Stop recording' : 'Start recording'}
//             >
//               {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
//             </button>
//           </div>
//           {isListening && (
//             <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
//               <Loader2 className="w-4 h-4 animate-spin" />
//               Listening... Speak now
//             </div>
//           )}
//         </div>
//         <button
//           className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-md transition-colors duration-200 w-full md:w-auto"
//           onClick={handleGenerateContent}
//           disabled={isLoading}
//         >
//           {isLoading ? 'Processing...' : 'Generate Content'}
//         </button>

//         {isLoading && (
//           <div className="mt-4 text-center text-gray-500">Please wait, generating content...</div>
//         )}

//         {/* Results Display */}
//         {Object.keys(results).length > 0 && !('error' in results) && (
//           <div className="grid grid-cols-1 gap-6 mt-6">
//             {Object.entries(results).map(([key, value], index) => (
//               <Card
//                 key={key}
//                 className={`shadow-md border border-gray-200 rounded-lg overflow-hidden ${
//                   index % 2 === 0 ? 'bg-gray-900 text-white' : 'bg-white'
//                 }`}
//               >
//                 <CardHeader className={`${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-200'} p-4`}>
//                   <CardTitle className="text-lg font-semibold">
//                     {key.replace(/_/g, ' ').toUpperCase()}
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="p-4">
//                   {value ? (
//                     typeof value === 'object' ? (
//                       <>
//                         <p className="mb-3 text-sm text-gray-600">{value.description}</p>
//                         <pre className={`p-3 rounded-md text-sm ${index % 2 === 0 ? 'bg-gray-800 text-white' : 'bg-gray-100'} overflow-x-auto`}>
//                           <code>{value.output}</code>
//                         </pre>
//                       </>
//                     ) : (
//                       <pre className={`p-3 rounded-md text-sm ${index % 2 === 0 ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}>
//                         <code>{value}</code>
//                       </pre>
//                     )
//                   ) : (
//                     <p className="text-center text-gray-500">No data available.</p>
//                   )}
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// export default CrewAIContentGenerator;


import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Loader2, Globe2 } from 'lucide-react';

interface Results {
  [key: string]: string | { description: string; output: string } | null;
}

interface SocialMediaPost {
  description: string;
  output: string;
}

interface SocialMedia {
  linkedin?: SocialMediaPost;
  twitter?: SocialMediaPost;
}

interface Translation {
  language: string;
  translatedContent: string;
}

const CrewAIContentGenerator: React.FC = () => {
  const [textInput, setTextInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<Results | { error: string }>({});
  const [linkedinPost, setLinkedinPost] = useState<SocialMediaPost | null>(null);
  const [twitterPost, setTwitterPost] = useState<SocialMediaPost | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [translations, setTranslations] = useState<Translation[]>([]);

  const availableLanguages = [
    { code: 'hi', name: 'Hindi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'mr', name: 'Marathi' },
    { code: 'bn', name: 'Bengali' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'ur', name: 'Urdu' }
  ];

  useEffect(() => {
    if (window.webkitSpeechRecognition) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            currentInterim += transcript;
          }
        }

        if (finalTranscript) {
          setTextInput(prevInput => {
            const newInput = prevInput ? `${prevInput.trim()} ${finalTranscript}` : finalTranscript;
            return newInput.charAt(0).toUpperCase() + newInput.slice(1);
          });
        }
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      setRecognition(recognition);
    }
  }, []);

  const toggleLanguage = (languageCode: string) => {
    setSelectedLanguages(prev => 
      prev.includes(languageCode)
        ? prev.filter(code => code !== languageCode)
        : [...prev, languageCode]
    );
  };

  const handleTranslate = async () => {
    if (!textInput.trim() || selectedLanguages.length === 0) return;

    setIsLoading(true);
    const newTranslations: Translation[] = [];

    try {
      for (const langCode of selectedLanguages) {
        const response = await fetch('http://127.0.0.1:5000/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: textInput,
            target_language: langCode
          }),
        });

        const data = await response.json();
        if (data.success) {
          newTranslations.push({
            language: availableLanguages.find(lang => lang.code === langCode)?.name || langCode,
            translatedContent: data.translation
          });
        }
      }
      setTranslations(newTranslations);
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      setInterimTranscript('');
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const clearInput = () => {
    setTextInput('');
    setInterimTranscript('');
    setTranslations([]);
  };

  const handleGenerateContent = async () => {
    if (!textInput.trim()) {
      alert('Please enter a topic or content request.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/process_input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textInput }),
      });

      const data: {
        success: boolean;
        results: Results;
        error?: string;
        social_media?: SocialMedia;
      } = await response.json();

      if (data.success) {
        setResults(data.results);
        if (data.social_media) {
          setLinkedinPost(data.social_media.linkedin || null);
          setTwitterPost(data.social_media.twitter || null);
        }
        // Automatically translate the generated content
        if (selectedLanguages.length > 0) {
          await handleTranslate();
        }
      } else {
        setResults({ error: data.error || 'An unknown error occurred.' });
      }
    } catch (error) {
      setResults({ error: String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full mx-auto my-8 p-6 shadow-xl rounded-lg bg-gray-900">
      <CardHeader className="bg-gray-900 text-white p-4">
        <CardTitle className="text-2xl font-semibold">
          CrewAI Content Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-gray-100 p-6">
        <div className="mb-6">
          <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
            Enter a topic or content request:
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                id="text-input"
                className="border border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="e.g., AI-generated story"
              />
              {interimTranscript && (
                <div className="absolute left-0 right-0 top-full mt-1 p-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-600">
                  {interimTranscript}
                </div>
              )}
            </div>
            <button
              onClick={clearInput}
              className="p-3 rounded-md bg-gray-500 hover:bg-gray-600 text-white"
              title="Clear input"
            >
              ✕
            </button>
            <button
              onClick={toggleListening}
              className={`p-3 rounded-md transition-colors duration-200 ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
              title={isListening ? 'Stop recording' : 'Start recording'}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          </div>
          {isListening && (
            <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Listening... Speak now
            </div>
          )}
        </div>

        {/* Language Selection */}
        {/* <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select languages for translation:
          </label>
          <div className="flex flex-wrap gap-2">
            {availableLanguages.map(lang => (
              <button
                key={lang.code}
                onClick={() => toggleLanguage(lang.code)}
                className={`px-3 py-1 rounded-full text-sm flex items-center gap-1
                  ${selectedLanguages.includes(lang.code)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                <Globe2 className="w-4 h-4" />
                {lang.name}
              </button>
            ))}
          </div>
        </div> */}

        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-md transition-colors duration-200 w-full md:w-auto"
          onClick={handleGenerateContent}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Generate Content'}
        </button>

        {isLoading && (
          <div className="mt-4 text-center text-gray-500">Please wait, generating content...</div>
        )}

        {/* Results Display */}
        {Object.keys(results).length > 0 && !('error' in results) && (
          <div className="grid grid-cols-1 gap-6 mt-6">
            {Object.entries(results).map(([key, value], index) => (
              <Card
                key={key}
                className={`shadow-md border border-gray-200 rounded-lg overflow-hidden ${
                  index % 2 === 0 ? 'bg-gray-900 text-white' : 'bg-white'
                }`}
              >
                <CardHeader className={`${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-200'} p-4`}>
                  <CardTitle className="text-lg font-semibold">
                    {key.replace(/_/g, ' ').toUpperCase()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {value ? (
                    typeof value === 'object' ? (
                      <>
                        <p className="mb-3 text-sm text-gray-600">{value.description}</p>
                        <pre className={`p-3 rounded-md text-sm ${index % 2 === 0 ? 'bg-gray-800 text-white' : 'bg-gray-100'} overflow-x-auto`}>
                          <code>{value.output}</code>
                        </pre>
                      </>
                    ) : (
                      <pre className={`p-3 rounded-md text-sm ${index % 2 === 0 ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}>
                        <code>{value}</code>
                      </pre>
                    )
                  ) : (
                    <p className="text-center text-gray-500">No data available.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Translations Display */}
        {translations.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Translations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {translations.map((translation, index) => (
                <Card key={index} className="bg-white">
                  <CardHeader className="bg-gray-50">
                    <CardTitle className="text-md font-medium">{translation.language}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-gray-800">{translation.translatedContent}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CrewAIContentGenerator;