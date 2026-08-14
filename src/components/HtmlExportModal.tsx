import React, { useState } from 'react';
import { X, Code2, Copy, Check, Download, FileCode, ExternalLink } from 'lucide-react';
import { IntegrationConfig } from '../types';
import { generateStandaloneHtml } from '../utils/exportHtml';

interface HtmlExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: IntegrationConfig;
}

export const HtmlExportModal: React.FC<HtmlExportModalProps> = ({
  isOpen,
  onClose,
  config
}) => {
  if (!isOpen) return null;

  const htmlCode = generateStandaloneHtml(config);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'diagnostico_ia_empretec.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold">
              <FileCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Código HTML Único do Formulário</h3>
              <p className="text-xs text-slate-400">Pronto para hospedar em qualquer servidor ou Vercel/Netlify</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Este arquivo contém todo o <strong>Tailwind CSS (CDN)</strong>, <strong>Lucide Icons (CDN)</strong> e o <strong>JavaScript</strong> com chamadas REST API para Supabase e n8n.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'Copiar Código'}
            </button>
            <button
              onClick={handleDownload}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Baixar index.html
            </button>
          </div>
        </div>

        {/* Code Editor Preview */}
        <div className="p-4 bg-slate-950 overflow-y-auto flex-1 font-mono text-xs text-slate-200 leading-relaxed border-b border-slate-800">
          <pre>
            <code>{htmlCode}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Substitua as constantes <code className="bg-slate-200 text-slate-800 px-1 rounded font-mono">SUPABASE_URL</code> e <code className="bg-slate-200 text-slate-800 px-1 rounded font-mono">N8N_WEBHOOK_URL</code> no arquivo se necessário.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
