export type LegalSection = {
  id: string;
  heading: string;
  body: string[];
  list?: string[];
  after?: string[];
  table?: { head: string[]; rows: string[][] };
};

export function parseLegalMarkdown(markdown: string) {
  const [header, ...sectionBlocks] = markdown.trim().split(/\n(?=## )/);
  const [titleLine, updatedLine, ...introLines] = header.split(/\n\s*\n/);

  return {
    title: titleLine.replace(/^# /, ""),
    updated: updatedLine.replace(/^\*\*Last updated:\s*|\*\*$/g, ""),
    intro: introLines.join(" "),
    sections: sectionBlocks.map((block) => {
      const [headingLine, ...contentBlocks] = block.trim().split(/\n\s*\n/);
      const body: string[] = [];
      const after: string[] = [];
      let list: string[] | undefined;
      let table: LegalSection["table"];

      for (const content of contentBlocks) {
        const lines = content.trim().split("\n");
        if (lines.every((line) => line.startsWith("- "))) {
          list = lines.map((line) => line.slice(2));
        } else if (lines.length > 2 && /^\|[-:| ]+\|$/.test(lines[1])) {
          const rows = lines.map((line) =>
            line
              .slice(1, -1)
              .split("|")
              .map((cell) => cell.trim()),
          );
          table = { head: rows[0], rows: rows.slice(2) };
        } else {
          (list || table ? after : body).push(lines.join(" ").replace(/\s{2,}/g, " "));
        }
      }

      const heading = headingLine.replace(/^##\s+(?:\d+\.\s*)?/, "");
      return {
        id: heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        heading,
        body,
        list,
        table,
        after: after.length ? after : undefined,
      } satisfies LegalSection;
    }),
  };
}
