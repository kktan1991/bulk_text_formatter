import React, { useState, useMemo } from 'react';
import { Copy, Trash2, ArrowRightLeft, Type, AlignLeft, Settings2, Check } from 'lucide-react';

type CaseOption = 'original' | 'uppercase' | 'lowercase' | 'titlecase';

interface FormatterOptions {
  caseOption: CaseOption;
  removeLineBreaks: boolean;
  cleanExtraSpaces: boolean;
  prefix: string;
  suffix: string;
  removeEmptyLines: boolean;
}

export default function App() {
  const [inputText, setInputText] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<FormatterOptions>({
    caseOption: 'original',
    removeLineBreaks: false,
    cleanExtraSpaces: false,
    prefix: '',
    suffix: '',
    removeEmptyLines: false,
  });

  const outputText = useMemo(() => {
    let result = inputText;

    if (options.removeEmptyLines) {
      result = result.split('\n').filter(line => line.trim().length > 0).join('\n');
    }

    if (options.cleanExtraSpaces) {
      result = result.split('\n').map(line => line.replace(/[ \t]+/g, ' ').trim()).join('\n');
    }

    if (options.removeLineBreaks) {
      result = result.replace(/\n/g, ' ');
    }

    if (options.caseOption === 'uppercase') {
      result = result.toUpperCase();
    } else if (options.caseOption === 'lowercase') {
      result = result.toLowerCase();
    } else if (options.caseOption === 'titlecase') {
      result = result.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
      );
    }

    if (options.prefix || options.suffix) {
      result = result.split('\n').map(line => {
        if (line.length === 0 && !options.prefix && !options.suffix) return line;
        return `${options.prefix}${line}${options.suffix}`;
      }).join('\n');
    }

    return result;
  }, [inputText, options]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Type size={20} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Bulk Text Formatter</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setInputText('')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 size={16} />
            Clear
          </button>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Output'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar Options */}
        <aside className="w-full lg:w-80 bg-white border-r border-neutral-200 overflow-y-auto flex-shrink-0">
          <div className="p-6 space-y-8">
            
            {/* Case Conversion */}
            <section>
              <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Type size={16} className="text-neutral-500" />
                Case Conversion
              </h3>
              <div className="space-y-2">
                {(['original', 'uppercase', 'lowercase', 'titlecase'] as CaseOption[]).map((c) => (
                  <label key={c} className="flex items-center gap-3 p-2 rounded-md hover:bg-neutral-50 cursor-pointer transition-colors">
                    <input 
                      type="radio" 
                      name="caseOption" 
                      value={c}
                      checked={options.caseOption === c}
                      onChange={(e) => setOptions({...options, caseOption: e.target.value as CaseOption})}
                      className="w-4 h-4 text-blue-600 border-neutral-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-neutral-700 capitalize">{c}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Spacing & Lines */}
            <section>
              <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlignLeft size={16} className="text-neutral-500" />
                Spacing & Lines
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-2 rounded-md hover:bg-neutral-50 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={options.cleanExtraSpaces}
                    onChange={(e) => setOptions({...options, cleanExtraSpaces: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-neutral-700">Clean extra spaces</span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-md hover:bg-neutral-50 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={options.removeEmptyLines}
                    onChange={(e) => setOptions({...options, removeEmptyLines: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-neutral-700">Remove empty lines</span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-md hover:bg-neutral-50 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={options.removeLineBreaks}
                    onChange={(e) => setOptions({...options, removeLineBreaks: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-neutral-700">Remove all line breaks</span>
                </label>
              </div>
            </section>

            {/* Prefix & Suffix */}
            <section>
              <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Settings2 size={16} className="text-neutral-500" />
                Prefix & Suffix
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Add to start of each line</label>
                  <input 
                    type="text" 
                    value={options.prefix}
                    onChange={(e) => setOptions({...options, prefix: e.target.value})}
                    placeholder="e.g. - "
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Add to end of each line</label>
                  <input 
                    type="text" 
                    value={options.suffix}
                    onChange={(e) => setOptions({...options, suffix: e.target.value})}
                    placeholder="e.g. ,"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  />
                </div>
              </div>
            </section>

          </div>
        </aside>

        {/* Editors */}
        <div className="flex-1 flex flex-col lg:flex-row p-6 gap-6 overflow-hidden bg-neutral-100/50">
          
          {/* Input */}
          <div className="flex-1 flex flex-col bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
              <h2 className="text-sm font-medium text-neutral-700">Input</h2>
              <span className="text-xs text-neutral-400">{inputText.length} chars</span>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your text here..."
              className="flex-1 w-full p-4 resize-none focus:outline-none focus:ring-0 text-neutral-800 font-mono text-sm leading-relaxed"
            />
          </div>

          {/* Divider / Icon (Desktop only) */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="bg-white p-2 rounded-full border border-neutral-200 shadow-sm text-neutral-400">
              <ArrowRightLeft size={20} />
            </div>
          </div>

          {/* Output */}
          <div className="flex-1 flex flex-col bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
              <h2 className="text-sm font-medium text-neutral-700">Output</h2>
              <span className="text-xs text-neutral-400">{outputText.length} chars</span>
            </div>
            <textarea
              value={outputText}
              readOnly
              placeholder="Formatted text will appear here..."
              className="flex-1 w-full p-4 resize-none focus:outline-none focus:ring-0 text-neutral-800 font-mono text-sm leading-relaxed bg-neutral-50/30"
            />
          </div>

        </div>
      </main>
    </div>
  );
}
