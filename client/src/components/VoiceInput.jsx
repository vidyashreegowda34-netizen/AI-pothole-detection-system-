import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Volume2 } from 'lucide-react';

export default function VoiceInput({ onTranscriptChange, currentText = '' }) {
  const { t, i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check SpeechRecognition API support
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      // Prefer Kannada if active, else English
      recognition.lang = i18n.language === 'kn' ? 'kn-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg(null);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          const updated = currentText ? `${currentText} ${finalTranscript}` : finalTranscript;
          onTranscriptChange(updated);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg('Microphone access was denied. Please allow mic permissions.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [i18n.language, currentText]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setErrorMsg('Speech recognition is not supported in this browser. Please use Chrome/Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setErrorMsg(null);
      try {
        recognitionRef.current.lang = i18n.language === 'kn' ? 'kn-IN' : 'en-IN';
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={toggleListening}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isListening
              ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30 ring-2 ring-red-300'
              : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4" />
              <span>{t('report.stopListening')}</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 text-amber-700" />
              <span>{t('report.voiceButton')}</span>
            </>
          )}
        </button>

        {isListening && (
          <span className="text-xs text-red-600 font-medium flex items-center space-x-1 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span>
            <span>{t('report.listening')}</span>
          </span>
        )}
      </div>

      {errorMsg && (
        <p className="text-[11px] text-red-600 italic mt-1">{errorMsg}</p>
      )}
    </div>
  );
}
