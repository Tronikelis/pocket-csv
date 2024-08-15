const DELIMITER = ",";

export class PocketCSV {
  private columns: string[];
  private rows: string[][];

  constructor(csv?: string) {
    this.columns = [];
    this.rows = [];

    if (csv) {
      const [col, ...rows] = parseCSV(csv);
      if (col) this.setColumns(col);
      this.setRows(rows);
    }
  }

  private escapeValue(value: string) {
    const escapedDouble = value.replaceAll(`"`, `""`);
    return `"${escapedDouble}"`;
  }

  setColumns(columns: string[]): this {
    this.columns = columns.map(this.escapeValue);
    return this;
  }

  addColumn(column: string): this {
    this.columns.push(this.escapeValue(column));
    return this;
  }

  setRows(rows: string[][]): this {
    this.rows = rows.map((x) => x.map(this.escapeValue));
    return this;
  }

  addRow(row: string[]): this {
    this.rows.push(row.map(this.escapeValue));
    return this;
  }

  raw(): string[][] {
    return [this.columns, ...this.rows];
  }

  toString(): string {
    let str = "";

    str += this.columns.join(DELIMITER);
    str += "\r\n";

    for (const row of this.rows) {
      str += row.join(DELIMITER);
      str += "\r\n";
    }

    return str;
  }
}

class Seeker {
  private pointer: number;
  private str: string;

  constructor(str: string) {
    this.pointer = 0;
    this.str = str;
  }

  next(): string | undefined {
    return this.str[this.pointer++];
  }

  peekNext(offset = 0): string | undefined {
    return this.str[this.pointer + offset];
  }

  peekPrev(offset = 0): string | undefined {
    return this.str[this.pointer - (offset + 1)];
  }

  nextTill(predicate: (char: string) => number): string {
    let x: string | undefined;
    let pr = 0;
    let final = "";

    while (!!(x = this.peekNext()) && (pr = predicate(x)) !== 0) {
      for (let i = 0; i < pr; i++) {
        final += this.next()!;
      }
    }

    return final;
  }

  seek(plus: number) {
    this.pointer += plus;
  }
}

export function parseCSV(csv: string, delimiter = DELIMITER): string[][] {
  csv = csv.trim().replaceAll("\r\n", "\n").replaceAll("\r", "\n");

  const seeker = new Seeker(csv);

  const result: string[][] = [];
  let buf: string[] = [];

  while (seeker.peekNext()) {
    const next = seeker.next();

    switch (next) {
      case "\n":
        result.push(buf);
        buf = [];
        break;

      case '"': {
        const tillQuote = seeker.nextTill((char) => {
          if (char === '"' && seeker.peekNext(1) === '"') {
            return 2;
          }

          if (char === '"') {
            return 0;
          }

          return 1;
        });
        seeker.seek(1);

        buf.push(tillQuote.replaceAll('""', '"'));
        break;
      }

      case delimiter: {
        // comma is first in line
        const prev = seeker.peekPrev(1);
        if (!prev || prev === "\n") {
          buf.push("");
        }

        const next = seeker.peekNext();
        if (!next || next === delimiter || next === "\n") {
          buf.push("");
        }

        break;
      }

      default: {
        const tillComma = seeker.nextTill((char) => {
          if (char === delimiter || char === "\n") {
            return 0;
          }

          return 1;
        });

        buf.push(next + tillComma);
        break;
      }
    }
  }

  if (buf.length !== 0) {
    result.push(buf);
  }

  return result;
}
