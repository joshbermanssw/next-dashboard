export const curlyBracketFormatter = (byLine: React.ReactNode) => {
    if (!byLine) {
      return null;
    }
  
    const text = Array.isArray(byLine) ? byLine.join('') : String(byLine);
  
    return text.split(/({(?:[^}\\]|\\.)*?})/).map((part: string, index: number) => {
      if (part.startsWith('{') && part.endsWith('}')) {
        const content = part.slice(1, -1).replace(/\\}/g, '}');
        return (
          <span
            key={`${index}-${part}`}
            className="text-[#74BBF2]"
          >
            {content}
          </span>
        );
      }
      return part;
    });
  };
  