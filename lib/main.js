exports.activate = function () {
  if (!atom.grammars.addInjectionPoint) return

  atom.grammars.addInjectionPoint('source.latex', {
    type: 'verbatim_env',

    language (node) {
      const openTag = node.firstChild;
      if (openTag.child(1).child(1).text === 'minted') {
        return openTag.child(2).child(1).text
      }
    },

    content (node) {
      return node.child(1)
    }
  })
}
