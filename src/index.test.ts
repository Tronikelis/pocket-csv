import { it, describe, expect, beforeEach } from "vitest";
import { parseCSV, PocketCSV } from "./";

describe("parseCSV", () => {
  let input = "";

  it("handles empty", () => {
    input = "";
    expect(parseCSV(input)).toEqual([]);
  });

  it("handles without quotes", () => {
    input = "foo,bar\nfoobar,barfoo";
    expect(parseCSV(input)).toEqual([
      ["foo", "bar"],
      ["foobar", "barfoo"],
    ]);
  });

  it("works with CRLF", () => {
    input = "foo,bar\r\n,foobar,barfoo";
    expect(parseCSV(input)).toEqual([
      ["foo", "bar"],
      ["foobar", "barfoo"],
    ]);
  });

  it("handles with quotes", () => {
    input = '"foo","bar"\n"foobar","barfoo';
    expect(parseCSV(input)).toEqual([
      ["foo", "bar"],
      ["foobar", "barfoo"],
    ]);
  });

  it("handles quote escape", () => {
    input = '"foo""bar","bar"';
    expect(parseCSV(input)).toEqual([['foo"bar', "bar"]]);
  });

  it("leaves newline in quoted", () => {
    input = '"foo\n","bar"';
    expect(parseCSV(input)).toEqual([["foo\n", "bar"]]);
  });

  it("interchangeable quotes", () => {
    input = '"foo",bar\nfoobar,"barfoo"';
    expect(parseCSV(input)).toEqual([
      ["foo", "bar"],
      ["foobar", "barfoo"],
    ]);
  });
});

describe("PocketCSV", () => {
  let pocketCSV: PocketCSV;

  beforeEach(() => {
    pocketCSV = new PocketCSV();
  });

  it("adds columns n rows", () => {
    pocketCSV.setColumns(["foo", "bar"]);
    pocketCSV.addRow(["foobar", "barfoo"]);

    expect(pocketCSV.toString()).toBe('"foo","bar"\r\n"foobar","barfoo"\r\n');
  });

  it('escapes " and leaves \\n', () => {
    pocketCSV.setColumns(['"\n']);
    expect(pocketCSV.toString()).toBe('"""\n"\r\n');
  });
});
