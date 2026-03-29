import React, { useState, useMemo } from 'react';
import { Copy, Trash2, ArrowRightLeft, Type, AlignLeft, Settings2, Check, HelpCircle } from 'lucide-react';

function Tooltip({ content }: { content: React.ReactNode }) {
  return (
    <div className="group relative flex items-center" onClick={(e) => e.preventDefault()}>
      <HelpCircle size={14} className="text-neutral-400 hover:text-blue-500 cursor-help transition-colors" />
      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-max max-w-xs p-3 bg-neutral-800 text-white text-xs normal-case tracking-normal rounded shadow-lg z-50 text-left pointer-events-none invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200">
        {content}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-neutral-800"></div>
      </div>
    </div>
  );
}

type CaseOption = 'original' | 'uppercase' | 'lowercase' | 'titlecase' | 'propercase' | 'sentencecase';

interface FormatterOptions {
  caseOption: CaseOption;
  removeLineBreaks: boolean;
  cleanExtraSpaces: boolean;
  prefix: string;
  suffix: string;
  removeEmptyLines: boolean;
  addLineNumbers: boolean;
  addBulletPoints: boolean;
  removeDuplicates: boolean;
  normalizeVerticalSpacing: boolean;
  normalizePunctuation: boolean;
  cleanCsvSpaces: boolean;
  cleanJson: boolean;
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
    addLineNumbers: false,
    addBulletPoints: false,
    removeDuplicates: false,
    normalizeVerticalSpacing: false,
    normalizePunctuation: false,
    cleanCsvSpaces: false,
    cleanJson: false,
  });

  const outputText = useMemo(() => {
    let lines = inputText.split('\n');

    if (options.removeEmptyLines) {
      lines = lines.filter(line => line.trim().length > 0);
    } else if (options.normalizeVerticalSpacing) {
      const normalizedLines: string[] = [];
      let prevEmpty = false;
      for (const line of lines) {
        const isEmpty = line.trim().length === 0;
        if (isEmpty) {
          if (!prevEmpty) {
            normalizedLines.push(line);
            prevEmpty = true;
          }
        } else {
          normalizedLines.push(line);
          prevEmpty = false;
        }
      }
      lines = normalizedLines;
    }

    if (options.cleanExtraSpaces) {
      lines = lines.map(line => line.replace(/[ \t]+/g, ' ').trim());
    }

    if (options.normalizePunctuation) {
      lines = lines.map(line => line.replace(/([.,!?]+)([a-zA-Z])/g, '$1 $2'));
    }

    if (options.cleanCsvSpaces) {
      lines = lines.map(line => line.replace(/\s*,\s*/g, ','));
    }

    if (options.cleanJson) {
      lines = lines.map(line => line.replace(/["']/g, '').replace(/,\s*$/, ''));
    }

    if (options.removeDuplicates) {
      lines = Array.from(new Set(lines));
    }

    if (options.caseOption === 'uppercase') {
      lines = lines.map(line => line.toUpperCase());
    } else if (options.caseOption === 'lowercase') {
      lines = lines.map(line => line.toLowerCase());
    } else if (options.caseOption === 'propercase') {
      lines = lines.map(line => line.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
      ));
    } else if (options.caseOption === 'sentencecase') {
      lines = lines.map(line => {
        const match = line.match(/^(\s*)(.*)$/);
        if (!match || !match[2]) return line;
        return match[1] + match[2].charAt(0).toUpperCase() + match[2].substring(1).toLowerCase();
      });
    } else if (options.caseOption === 'titlecase') {
      const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|v\.?|vs\.?|via)$/i;
      lines = lines.map(line => line.replace(
        /\w\S*/g,
        (txt, offset) => {
          if (offset > 0 && smallWords.test(txt)) {
            return txt.toLowerCase();
          }
          return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
        }
      ));
    }

    if (options.prefix || options.suffix) {
      lines = lines.map(line => {
        if (line.length === 0 && !options.prefix && !options.suffix) return line;
        return `${options.prefix}${line}${options.suffix}`;
      });
    }

    if (options.addLineNumbers) {
      const padLength = String(lines.length).length;
      lines = lines.map((line, index) => {
        const num = String(index + 1).padStart(padLength, '0');
        return `${num}. ${line}`;
      });
    }

    if (options.addBulletPoints) {
      lines = lines.map(line => `• ${line}`);
    }

    let result = lines.join('\n');

    if (options.removeLineBreaks) {
      result = result.replace(/\n/g, ' ');
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
                <Tooltip content={
                  <div className="flex flex-col gap-2">
                    <p>Changes the capitalization of all text.</p>
                    <div className="text-neutral-300 font-mono text-[11px] leading-relaxed">
                      <p><span className="text-white font-medium">Original:</span> the lord of the rings</p>
                      <p><span className="text-white font-medium">Uppercase:</span> THE LORD OF THE RINGS</p>
                      <p><span className="text-white font-medium">Lowercase:</span> the lord of the rings</p>
                      <p><span className="text-white font-medium">Sentence case:</span> The lord of the rings</p>
                      <p><span className="text-white font-medium">Proper case:</span> The Lord Of The Rings</p>
                      <p><span className="text-white font-medium">Title case:</span> The Lord of the Rings</p>
                    </div>
                  </div>
                } />
              </h3>
              <div className="space-y-2">
                {(['original', 'uppercase', 'lowercase', 'sentencecase', 'propercase', 'titlecase'] as CaseOption[]).map((c) => {
                  const caseLabels: Record<CaseOption, string> = {
                    original: 'Original',
                    uppercase: 'Uppercase',
                    lowercase: 'Lowercase',
                    sentencecase: 'Sentence case',
                    propercase: 'Proper case',
                    titlecase: 'Title case'
                  };
                  return (
                    <label key={c} className="flex items-center gap-3 p-2 rounded-md hover:bg-neutral-50 cursor-pointer transition-colors">
                      <input 
                        type="radio" 
                        name="caseOption" 
                        value={c}
                        checked={options.caseOption === c}
                        onChange={(e) => setOptions({...options, caseOption: e.target.value as CaseOption})}
                        className="w-4 h-4 text-blue-600 border-neutral-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-neutral-700">{caseLabels[c]}</span>
                    </label>
                  );
                })}
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
                  <span className="text-sm text-neutral-700 flex items-center gap-1.5">Clean extra spaces <Tooltip content="Removes multiple consecutive spaces and trims spaces at the ends of lines." /></span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-md hover:bg-neutral-50 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={options.normalizeVerticalSpacing}
                    onChange={(e) => setOptions({...options, normalizeVerticalSpacing: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-neutral-700 flex items-center gap-1.5">Normalize vertical spacing <Tooltip content="Reduces multiple blank lines down to a single blank line." /></span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-md hover:bg-neutral-50 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={options.normalizePunctuation}
                    onChange={(e) => setOptions({...options, normalizePunctuation: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-neutral-700 flex items-center gap-1.5">Normalize punctuation <Tooltip content="Ensures there is a space after commas, periods, exclamation, and question marks." /></span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-md hover:bg-neutral-50 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={options.cleanCsvSpaces}
                    onChange={(e) => setOptions({...options, cleanCsvSpaces: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-neutral-700 flex items-center gap-1.5">CSV-like text cleanup <Tooltip content="Removes spaces around commas to standardize lists (e.g., 'apple , banana' becomes 'apple,banana')." /></span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-md hover:bg-neutral-50 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={options.cleanJson}
                    onChange={(e) => setOptions({...options, cleanJson: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-neutral-700 flex items-center gap-1.5">JSON-like raw text <Tooltip content="Removes quotes and trailing commas to clean up JSON-like key-value pairs." /></span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-md hover:bg-neutral-50 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={options.removeEmptyLines}
                    onChange={(e) => setOptions({...options, removeEmptyLines: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-neutral-700 flex items-center gap-1.5">Remove empty lines <Tooltip content="Deletes all lines that contain no text or only spaces." /></span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-md hover:bg-neutral-50 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={options.removeDuplicates}
                    onChange={(e) => setOptions({...options, removeDuplicates: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-neutral-700 flex items-center gap-1.5">Remove duplicates <Tooltip content="Removes exact duplicate lines, keeping only the first occurrence." /></span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-md hover:bg-neutral-50 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={options.addLineNumbers}
                    onChange={(e) => setOptions({...options, addLineNumbers: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-neutral-700 flex items-center gap-1.5">Add line numbers <Tooltip content="Adds sequential numbers (01., 02., etc.) to the beginning of each line." /></span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-md hover:bg-neutral-50 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={options.addBulletPoints}
                    onChange={(e) => setOptions({...options, addBulletPoints: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-neutral-700 flex items-center gap-1.5">Add bullet points <Tooltip content="Adds a bullet point (•) to the beginning of each line." /></span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-md hover:bg-neutral-50 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={options.removeLineBreaks}
                    onChange={(e) => setOptions({...options, removeLineBreaks: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-neutral-700 flex items-center gap-1.5">Remove all line breaks <Tooltip content="Joins all lines into a single continuous paragraph." /></span>
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
                  <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 mb-1">
                    Add to start of each line
                    <Tooltip content="Text to insert at the very beginning of every line." />
                  </label>
                  <input 
                    type="text" 
                    value={options.prefix}
                    onChange={(e) => setOptions({...options, prefix: e.target.value})}
                    placeholder="e.g. - "
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 mb-1">
                    Add to end of each line
                    <Tooltip content="Text to append at the very end of every line." />
                  </label>
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
