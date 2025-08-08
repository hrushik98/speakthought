'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

export default function Thoughts2Todo() {
  const [isRecording, setIsRecording] = useState(false)
  const [todos, setTodos] = useState<Todo[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'transcribing' | 'generating'>('idle')
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number>()
  const audioDataRef = useRef<Uint8Array | null>(null)
  
  const { toast } = useToast()

  // Load todos from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('thoughts2todo-todos')
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos))
    }
  }, [])

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('thoughts2todo-todos', JSON.stringify(todos))
  }, [todos])

  // Audio level visualization with real voice data
  const updateAudioLevel = () => {
    if (analyserRef.current && isRecording) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
      analyserRef.current.getByteFrequencyData(dataArray)
      audioDataRef.current = dataArray
      
      // Calculate RMS (Root Mean Square) for more accurate voice detection
      const rms = Math.sqrt(dataArray.reduce((sum, value) => sum + value * value, 0) / dataArray.length)
      setAudioLevel(rms)
      
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Set up audio analysis for visualization
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        await processAudio(audioBlob)
        
        // Clean up
        stream.getTracks().forEach(track => track.stop())
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        setAudioLevel(0)
      }

      mediaRecorder.start()
      setIsRecording(true)
      updateAudioLevel()
      
      toast({
        title: "Recording started",
        description: "Speak your thoughts and click the mic again to stop.",
      })
    } catch (error) {
      console.error('Error starting recording:', error)
      toast({
        title: "Recording failed",
        description: "Please check your microphone permissions.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsProcessing(true)
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    try {
      setProcessingStatus('transcribing')
      
      // Step 1: Transcribe audio with Whisper
      const formData = new FormData()
      formData.append('audio', audioBlob, 'audio.wav')
      
      const transcriptionResponse = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })
      
      if (!transcriptionResponse.ok) {
        throw new Error('Transcription failed')
      }
      
      const { transcript } = await transcriptionResponse.json()
      
      if (!transcript || transcript.trim() === '') {
        toast({
          title: "No speech detected",
          description: "Please try recording again with clearer speech.",
          variant: "destructive",
        })
        setIsProcessing(false)
        setProcessingStatus('idle')
        return
      }

      setProcessingStatus('generating')

      // Step 2: Extract todos from transcript
      const todosResponse = await fetch('/api/extract-todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      })
      
      if (!todosResponse.ok) {
        throw new Error('Todo extraction failed')
      }
      
      const { todos: newTodos } = await todosResponse.json()
      
      if (newTodos && newTodos.length > 0) {
        const todosWithIds = newTodos.map((todo: string) => ({
          id: crypto.randomUUID(),
          text: todo,
          completed: false,
          createdAt: new Date().toISOString(),
        }))
        
        setTodos(prev => [...todosWithIds, ...prev])
        
        toast({
          title: "Todos extracted!",
          description: `Added ${newTodos.length} new todo${newTodos.length > 1 ? 's' : ''}.`,
        })
      } else {
        toast({
          title: "No todos found",
          description: "Try describing specific tasks or actions you need to do.",
        })
      }
    } catch (error) {
      console.error('Error processing audio:', error)
      toast({
        title: "Processing failed",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setProcessingStatus('idle')
    }
  }

  const toggleTodo = (id: string) => {
    setTodos(prev => 
      prev.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }

  // Generate real-time voice-reactive visualization bars
  const generateVisualizationBars = () => {
    const bars = []
    const numBars = 24
    const baseHeight = 4
    const maxHeight = 60
    
    for (let i = 0; i < numBars; i++) {
      let height = baseHeight
      
      if (isRecording && audioDataRef.current) {
        // Use actual frequency data for each bar
        const freqIndex = Math.floor((i / numBars) * audioDataRef.current.length)
        const freqValue = audioDataRef.current[freqIndex] || 0
        height = baseHeight + (freqValue / 255) * maxHeight
      } else if (isProcessing) {
        // Gentle pulse during processing
        height = baseHeight + Math.sin(Date.now() * 0.01 + i * 0.5) * 8
      }
      
      bars.push(
        <div
          key={i}
          className="rounded-full transition-all duration-75"
          style={{
            width: '4px',
            height: `${Math.max(baseHeight, height)}px`,
            background: isRecording 
              ? 'linear-gradient(to top, #ff6b6b, #ffa500, #ffeb3b)'
              : isProcessing
                ? 'linear-gradient(to top, #667eea, #764ba2)'
                : 'rgba(255, 255, 255, 0.2)',
            opacity: isRecording ? 0.9 : isProcessing ? 0.7 : 0.3,
          }}
        />
      )
    }
    return bars
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <span className="text-4xl mb-4 block">🌟</span>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
              How's it going, Hrushik!?
            </h1>
            <p className="text-gray-400 text-lg">Speak your thoughts, and I'll turn them into actionable todos</p>
          </div>
          
          {/* Main Recording Button */}
          <div className="relative">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`h-20 w-20 rounded-full border-2 transition-all duration-300 ${
                isRecording 
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 border-red-400 shadow-lg shadow-red-500/25' 
                  : isProcessing
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-blue-400 shadow-lg shadow-blue-500/25'
                    : 'bg-gradient-to-r from-orange-500 to-pink-600 border-orange-400 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40'
              }`}
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
              ) : isRecording ? (
                <MicOff className="h-8 w-8 text-white" />
              ) : (
                <Mic className="h-8 w-8 text-white" />
              )}
            </Button>
            
            {/* Status indicator */}
            {(isRecording || isProcessing) && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700">
                  <div className={`w-2 h-2 rounded-full mr-2 animate-pulse ${
                    isRecording ? 'bg-red-400' : 'bg-blue-400'
                  }`} />
                  <span className="text-white text-sm font-medium">
                    {isRecording ? 'Recording...' : 
                     processingStatus === 'transcribing' ? 'Transcribing speech...' :
                     processingStatus === 'generating' ? 'Generating todos...' : 'Processing...'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recording Visualization */}
        {(isRecording || isProcessing) && (
          <div className="flex items-center justify-center mb-12">
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
              <div className="flex items-end gap-2 h-24">
                {generateVisualizationBars()}
              </div>
            </div>
          </div>
        )}

        {/* Todo List */}
        {todos.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Your Todos</h2>
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 hover:bg-gray-800/70 transition-all duration-200 hover:border-gray-600/50"
              >
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo.id)}
                    className="h-5 w-5 border-gray-500 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-500 data-[state=checked]:to-pink-600 data-[state=checked]:border-orange-400"
                  />
                  <span
                    className={`flex-1 text-lg ${
                      todo.completed 
                        ? 'line-through text-gray-500' 
                        : 'text-white'
                    }`}
                  >
                    {todo.text}
                  </span>
                  <Button
                    onClick={() => deleteTodo(todo.id)}
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 hover:bg-red-950/20 transition-all duration-200"
                  >
                    ×
                  </Button>
                </div>
                <div className="text-xs text-gray-500 mt-2 ml-9">
                  {new Date(todo.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {todos.length === 0 && !isRecording && !isProcessing && (
          <div className="text-center py-16">
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-12 border border-gray-700/50 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mic className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Ready to capture your thoughts?
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Hit the microphone button above and start speaking. I'll automatically convert your speech into organized, actionable todos.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
