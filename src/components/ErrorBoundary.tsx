import * as React from 'react';
import { ShieldAlert, RefreshCw, Smartphone, Globe, Copy, Check } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      copied: false
    };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught runtime error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  private copyPublicLink = () => {
    const publicUrl = "https://ais-pre-n2zmwj5vdlaktpo2rdwo2v-119193402769.europe-west1.run.app";
    navigator.clipboard.writeText(publicUrl);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2500);
  };

  public override render(): React.ReactNode {
    if (this.state.hasError) {
      const publicUrl = "https://ais-pre-n2zmwj5vdlaktpo2rdwo2v-119193402769.europe-west1.run.app";

      return (
        <div className="min-h-screen bg-[#030712] text-slate-100 flex items-center justify-center p-4 font-sans select-none">
          <div className="w-full max-w-xl bg-slate-950 border border-amber-500/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-bold font-mono uppercase text-amber-300 tracking-wider">
                  Universal Phone Recovery Mode
                </h2>
                <p className="text-xs font-mono text-slate-400">
                  Compatibility Engine Auto-Recovered
                </p>
              </div>
            </div>

            {/* Error & 403 Google Access Fix Notice */}
            <div className="space-y-3 text-xs font-mono">
              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl text-slate-300 space-y-1">
                <span className="text-rose-400 font-bold block text-[11px] uppercase">
                  Detected Environment Exception:
                </span>
                <p className="text-[11px] text-slate-400 font-mono break-all">
                  {this.state.error?.toString() || "Older browser JS engine limitation or Google internal domain restricted access."}
                </p>
              </div>

              {/* Fix Google 403 Access Banner */}
              <div className="bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border border-blue-500/50 p-4 rounded-xl space-y-2 text-slate-200">
                <div className="flex items-center gap-2 font-bold text-blue-300 uppercase text-[11px]">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span>Fixing Google 403 "No Access" Error on Phones:</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  If you got a <strong>Google 403 Error</strong> on your phone (e.g. <code className="text-amber-300 font-mono">dio.google.com</code>), it is because that was an internal Google developer URL! Use the public link below to access the app on any phone without 403 login errors:
                </p>

                <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800 text-[10px] text-amber-300 break-all font-mono">
                  <span className="flex-1 truncate">{publicUrl}</span>
                  <button
                    onClick={this.copyPublicLink}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold uppercase transition flex items-center gap-1"
                  >
                    {this.state.copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                    <span>{this.state.copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-xs font-mono font-bold uppercase rounded-xl transition shadow flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Reset Cache & Reload Application</span>
              </button>

              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white text-xs font-mono font-bold uppercase rounded-xl transition shadow flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>Open Public Mobile App</span>
              </a>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
