// Scrapes all scopes from the TextMate and Tree-sitter grammars

const CSON = require('season')
const path = require('path')
const fs = require('fs')

const grammarPath = path.resolve('..', '..', 'grammars')

if (require.main === module) {
  main()
}

function main () {
  const scopes = new Set()
  const treeSitterScopes = new Set()
  const textMateScopes = new Set()

  const grammars = getGrammars()

  if (grammars === null) return

  grammars.forEach(grammar => {
    const ts = grammar.type && grammar.type === 'tree-sitter'
    let grammarScopes = ts ? getTreeSitterScopes(grammar) : getTextMateScopes(grammar)

    if (ts) {
      grammarScopes.forEach(s => treeSitterScopes.add(s))
    } else {
      grammarScopes.forEach(s => textMateScopes.add(s))
    }

    grammarScopes.forEach(s => scopes.add(s))
  })

  console.log('TextMate:\n', textMateScopes);
  console.log('Tree-sitter:\n', treeSitterScopes);
}

function getGrammars () {
  if (!fs.existsSync(grammarPath)) {
    console.error(`Cannot locate grammar directory ${grammarPath}`)
    return null
  }

  return fs.readdirSync(grammarPath)
    .map(filePath => getGrammar(path.join(grammarPath, filePath)))
    .filter(g => g !== null)
}

function getGrammar (filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File ${filePath} does not exist`)
    return null
  }

  return CSON.readFileSync(filePath)
}

function getTreeSitterScopes (grammar) {
  const scopes = new Set()

  Object.values(grammar.scopes).forEach(value => {
    if (typeof value === 'string') {
      scopes.add(value)
    } else if (Array.isArray(value)) {
      value.forEach(rule => {
        if (typeof rule === 'string') {
          scopes.add(rule)
        } else if (rule.scopes) {
          scopes.add(rule.scopes)
        }
      })
    }
  })

  return scopes
}

function getTextMateScopes (grammar, scopes=new Set(), topLevel=true) {
  const properties = Object.entries(grammar);

  properties.forEach(([key, value]) => {
    switch (key) {
      case 'name':
      case 'contentName':
        if (!topLevel) scopes.add(value)
        break
      default:
        if (typeof value === 'object' && value !== null) {
          getTextMateScopes(value, scopes, false)
        }
    }
  })

  return scopes
}
