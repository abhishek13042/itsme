import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('Page error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center 
          h-full py-24 px-6">
          <div className="w-12 h-12 bg-[#C0392B]/10 rounded-2xl 
            flex items-center justify-center mb-4">
            <span className="text-[#C0392B] text-xl">!</span>
          </div>
          <p className="text-sm font-bold text-[#1A1A2E] 
            font-['Inter'] mb-1">
            Something went wrong
          </p>
          <p className="text-xs text-[#9A9590] font-['Inter'] 
            text-center mb-4 max-w-xs">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="bg-[#1A1A2E] text-white px-4 py-2 rounded-xl
              text-xs font-bold font-['Space_Mono'] uppercase 
              tracking-wider"
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
