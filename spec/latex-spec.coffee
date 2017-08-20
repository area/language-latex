describe "latex grammar", ->
  grammar = null
  preamble = '\\documentclass{article} \\begin{document}'
  afterword = '\\end{document}'

  beforeEach ->
    waitsForPromise ->
      atom.packages.activatePackage('language-latex')

    runs ->
      grammar = atom.grammars.grammarForScopeName('text.tex.latex')

  it "parses the grammar", ->
    expect(grammar).toBeTruthy()
    expect(grammar.scopeName).toBe 'text.tex.latex'

  it "parses a simple article", ->
    s = "#{preamble} Hello, Latex! $2+3=5$ #{afterword}"
    tk = grammar.tokenizeLines(s)
    expect(tk[0][14].scopes[1]).toBe 'string.other.math.tex'
